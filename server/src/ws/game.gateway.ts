import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { type Difficulty, type FinishReason, type MatchResult, DEFAULT_TIME_LIMITS } from '../../../shared/types/game';
import {
  type GameActionPayload,
  type GameResultPayload,
} from '../../../shared/types/ws-events';
import { WsAuthGuard } from '../auth/ws-auth.guard';
import { AuthService } from '../auth/auth.service';
import { GameService } from '../game/game.service';
import { ScoringService } from '../game/scoring.service';
import { MatchQueueService } from '../match/match-queue.service';
import { MatchService } from '../match/match.service';

const FINISH_PRIORITY: Record<FinishReason, number> = {
  none: -1,
  forfeit: 0,
  died: 1,
  timeout: 1,
  survived: 2,
  cleared: 3,
};

const COUNTDOWN_SECONDS = 3;

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly gameTimers: Map<string, NodeJS.Timeout> = new Map();
  private readonly tickTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private readonly authService: AuthService,
    private readonly gameService: GameService,
    private readonly scoringService: ScoringService,
    private readonly matchQueueService: MatchQueueService,
    private readonly matchService: MatchService,
  ) {}

  handleConnection = (client: Socket): void => {
    const auth = client.handshake?.auth as Record<string, unknown> | undefined;
    if (!auth) {
      client.disconnect();
      return;
    }

    const token = auth.token as string | undefined;
    if (token) {
      const user = this.authService.validateToken(token);
      if (!user) {
        client.disconnect();
        return;
      }
      client.data = { userId: user.userId, nickname: user.nickname };
      return;
    }

    const userId = auth.userId as string | undefined;
    const nickname = auth.nickname as string | undefined;
    if (userId && nickname) {
      client.data = { userId, nickname };
      return;
    }

    client.disconnect();
  };

  handleDisconnect = (client: Socket): void => {
    const userId = client.data?.userId as string | undefined;

    this.matchQueueService.leave(client.id);

    if (userId) {
      const room = this.matchService.getRoomByPlayerId(userId);
      if (room) {
        const playerState = room.players.get(userId);
        if (playerState) {
          if (playerState.status === 'playing') {
            this.handlePlayerFinish(room.id, userId, 'lost', 'forfeit');
            this.stopOpponent(room.id, userId);
          } else if (playerState.status === 'idle') {
            this.cleanupRoom(room.id);
          }
        }
      }
    }
  };

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('queue:join')
  handleQueueJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { difficulty: Difficulty },
  ): void {
    const { userId, nickname } = client.data as { userId: string; nickname: string };
    const { difficulty } = payload;

    if (this.matchService.isPlayerInRoom(userId)) {
      client.emit('error', { code: 'ALREADY_IN_ROOM', message: 'Already in a game room' });
      return;
    }

    this.matchQueueService.leave(client.id);

    const position = this.matchQueueService.join(difficulty, {
      userId,
      nickname,
      socketId: client.id,
      joinedAt: Date.now(),
    });

    client.emit('queue:joined', { difficulty, position });

    const matched = this.matchQueueService.tryMatch(difficulty);
    if (matched) {
      const [player1, player2] = matched;
      const room = this.matchService.createRoom(difficulty, player1, player2);

      const socket1 = this.server.sockets.sockets.get(player1.socketId);
      const socket2 = this.server.sockets.sockets.get(player2.socketId);

      if (socket1) {
        socket1.join(room.id);
        socket1.emit('match:found', {
          roomId: room.id,
          opponent: { nickname: player2.nickname },
          difficulty,
        });
      }

      if (socket2) {
        socket2.join(room.id);
        socket2.emit('match:found', {
          roomId: room.id,
          opponent: { nickname: player1.nickname },
          difficulty,
        });
      }

      this.startCountdown(room.id);
    }

    this.broadcastQueueUpdate(difficulty);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('queue:leave')
  handleQueueLeave(@ConnectedSocket() client: Socket): void {
    const difficulty = this.matchQueueService.getDifficultyBySocketId(client.id);
    this.matchQueueService.leave(client.id);
    client.emit('queue:left', {});

    if (difficulty) {
      this.broadcastQueueUpdate(difficulty);
    }
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('game:action')
  handleGameAction(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: GameActionPayload,
  ): void {
    const { userId } = client.data as { userId: string; nickname: string };
    const room = this.matchService.getRoomByPlayerId(userId);

    if (!room) {
      client.emit('error', { code: 'NOT_IN_ROOM', message: 'Not in a game room' });
      return;
    }

    const playerState = room.players.get(userId);
    if (!playerState) {
      return;
    }

    if (playerState.status === 'idle' && room.startedAt !== null) {
      playerState.status = 'playing';
      playerState.startTime = room.startedAt;
    }

    if (playerState.status !== 'playing') {
      return;
    }

    const result = this.gameService.processAction(playerState.gameData, payload);
    playerState.gameData = result.gameData;

    if (result.status === 'won') {
      this.handlePlayerFinish(room.id, userId, 'won', (result.finishReason as FinishReason) || 'cleared');
      this.stopOpponent(room.id, userId);
      return;
    }

    if (result.status === 'lost') {
      this.handlePlayerFinish(room.id, userId, 'lost', (result.finishReason as FinishReason) || 'died');
      this.stopOpponent(room.id, userId);
      return;
    }

    this.sendStateUpdates(room.id, userId, playerState);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('game:forfeit')
  handleGameForfeit(@ConnectedSocket() client: Socket): void {
    const { userId } = client.data as { userId: string; nickname: string };
    const room = this.matchService.getRoomByPlayerId(userId);

    if (!room) {
      return;
    }

    const playerState = room.players.get(userId);
    if (!playerState) {
      return;
    }

    if (playerState.status === 'idle' && room.startedAt !== null) {
      playerState.status = 'playing';
      playerState.startTime = room.startedAt;
    }

    if (playerState.status !== 'playing') {
      return;
    }

    this.handlePlayerFinish(room.id, userId, 'lost', 'forfeit');
    this.stopOpponent(room.id, userId);
  }

  private broadcastQueueUpdate = (difficulty: Difficulty): void => {
    const queueSize = this.matchQueueService.getQueueSize(difficulty);
    const socketIds = this.matchQueueService.getWaitingSocketIds(difficulty);
    const estimatedWaitSeconds = queueSize >= 2 ? 5 : 30;

    const payload = { difficulty, queueSize, estimatedWaitSeconds };

    for (const socketId of socketIds) {
      const socket = this.server.sockets.sockets.get(socketId);
      if (socket) {
        socket.emit('queue:update', payload);
      }
    }
  };

  private startCountdown = (roomId: string): void => {
    this.server.to(roomId).emit('game:started', { countdown: COUNTDOWN_SECONDS });

    setTimeout(() => {
      const room = this.matchService.getRoom(roomId);
      if (!room) {
        return;
      }

      const now = Date.now();
      room.startedAt = now;

      for (const [userId, playerState] of room.players) {
        playerState.status = 'playing';
        playerState.startTime = now;
        playerState.gameData = this.gameService.initializeGameState(room.difficulty, { userId });
      }

      const timeLimit = DEFAULT_TIME_LIMITS[room.difficulty];
      const gameTimer = setTimeout(() => {
        this.handleTimeout(roomId);
      }, timeLimit * 1000);
      this.gameTimers.set(roomId, gameTimer);

      this.startTickTimer(roomId);
    }, COUNTDOWN_SECONDS * 1000);
  };

  private startTickTimer = (roomId: string): void => {
    const timer = setInterval(() => {
      const room = this.matchService.getRoom(roomId);
      if (!room) {
        this.stopTickTimer(roomId);
        return;
      }

      const now = Date.now();
      const players = [...room.players.entries()];

      for (const [userId, playerState] of players) {
        const myTime = playerState.startTime > 0 ? (now - playerState.startTime) / 1000 : 0;

        let opponentTime = 0;
        for (const [opId, opState] of players) {
          if (opId !== userId) {
            if (opState.status === 'won' || opState.status === 'lost') {
              opponentTime =
                opState.endTime && opState.startTime
                  ? (opState.endTime - opState.startTime) / 1000
                  : 0;
            } else {
              opponentTime = opState.startTime > 0 ? (now - opState.startTime) / 1000 : 0;
            }
          }
        }

        const playerSocket = this.server.sockets.sockets.get(playerState.socketId);
        if (playerSocket) {
          playerSocket.emit('game:timer-tick', { myTime, opponentTime });
        }
      }
    }, 1000);

    this.tickTimers.set(roomId, timer);
  };

  private stopTickTimer = (roomId: string): void => {
    const timer = this.tickTimers.get(roomId);
    if (timer) {
      clearInterval(timer);
      this.tickTimers.delete(roomId);
    }
  };

  private sendStateUpdates = (
    roomId: string,
    userId: string,
    playerState: { gameData: Record<string, unknown>; startTime: number; socketId: string },
  ): void => {
    const room = this.matchService.getRoom(roomId);
    if (!room) {
      return;
    }

    const elapsedTime = playerState.startTime > 0 ? (Date.now() - playerState.startTime) / 1000 : 0;
    const playerView = this.gameService.getPlayerStateView(playerState.gameData);
    const opponentView = this.gameService.getOpponentStateView(playerState.gameData);

    const playerSocket = this.server.sockets.sockets.get(playerState.socketId);
    if (playerSocket) {
      playerSocket.emit('game:state-update', { state: playerView, elapsedTime });
    }

    for (const [opponentId, opponentState] of room.players) {
      if (opponentId !== userId) {
        const opponentSocket = this.server.sockets.sockets.get(opponentState.socketId);
        if (opponentSocket) {
          opponentSocket.emit('game:opponent-state-update', { state: opponentView, elapsedTime });
        }
      }
    }
  };

  private handlePlayerFinish = (
    roomId: string,
    userId: string,
    status: 'won' | 'lost',
    finishReason: FinishReason,
  ): void => {
    const room = this.matchService.getRoom(roomId);
    if (!room) {
      return;
    }

    const playerState = room.players.get(userId);
    if (!playerState) {
      return;
    }

    playerState.status = status;
    playerState.finishReason = finishReason;
    playerState.endTime = Date.now();

    const elapsedTime =
      playerState.startTime > 0 ? (playerState.endTime - playerState.startTime) / 1000 : 0;

    playerState.score = this.scoringService.calculateScore({
      difficulty: room.difficulty,
      elapsedSeconds: elapsedTime,
      gameData: playerState.gameData,
      won: status === 'won',
    });

    for (const [opponentId, opponentState] of room.players) {
      if (opponentId !== userId) {
        const opponentSocket = this.server.sockets.sockets.get(opponentState.socketId);
        if (opponentSocket) {
          opponentSocket.emit('game:opponent-finished', {
            status,
            time: elapsedTime,
          });
        }
      }
    }

    if (this.matchService.checkBothFinished(roomId)) {
      const gameTimer = this.gameTimers.get(roomId);
      if (gameTimer) {
        clearTimeout(gameTimer);
        this.gameTimers.delete(roomId);
      }
      this.stopTickTimer(roomId);
      this.resolveMatch(roomId);
    }
  };

  private stopOpponent = (roomId: string, finishedUserId: string): void => {
    const room = this.matchService.getRoom(roomId);
    if (!room) {
      return;
    }
    for (const [opponentId, opponentState] of room.players) {
      if (opponentId !== finishedUserId && opponentState.status === 'playing') {
        this.handlePlayerFinish(roomId, opponentId, 'won', 'survived');
      }
    }
  };

  private handleTimeout = (roomId: string): void => {
    this.gameTimers.delete(roomId);
    this.stopTickTimer(roomId);
    const room = this.matchService.getRoom(roomId);
    if (!room) {
      return;
    }

    for (const [userId, playerState] of room.players) {
      if (playerState.status === 'playing') {
        this.handlePlayerFinish(roomId, userId, 'lost', 'timeout');
      }
    }
  };

  private resolveMatch = (roomId: string): void => {
    const room = this.matchService.getRoom(roomId);
    if (!room) {
      return;
    }

    room.finishedAt = Date.now();
    const players = [...room.players.entries()];

    if (players.length !== 2) {
      return;
    }

    const [player1Entry, player2Entry] = players;
    const [, ps1] = player1Entry;
    const [, ps2] = player2Entry;

    const time1 = ps1.endTime && ps1.startTime ? (ps1.endTime - ps1.startTime) / 1000 : 0;
    const time2 = ps2.endTime && ps2.startTime ? (ps2.endTime - ps2.startTime) / 1000 : 0;

    let result1: MatchResult;
    let result2: MatchResult;

    const p1Priority = FINISH_PRIORITY[ps1.finishReason];
    const p2Priority = FINISH_PRIORITY[ps2.finishReason];

    if (p1Priority > p2Priority) {
      result1 = 'win';
      result2 = 'lose';
    } else if (p1Priority < p2Priority) {
      result1 = 'lose';
      result2 = 'win';
    } else if (ps1.score > ps2.score) {
      result1 = 'win';
      result2 = 'lose';
    } else if (ps1.score < ps2.score) {
      result1 = 'lose';
      result2 = 'win';
    } else if (time1 < time2) {
      result1 = 'win';
      result2 = 'lose';
    } else if (time1 > time2) {
      result1 = 'lose';
      result2 = 'win';
    } else {
      result1 = 'draw';
      result2 = 'draw';
    }

    ps1.score += this.scoringService.calculateMultiplayerBonus(result1);
    ps2.score += this.scoringService.calculateMultiplayerBonus(result2);

    const result1Payload: GameResultPayload = {
      result: result1,
      myScore: ps1.score,
      opponentScore: ps2.score,
      myTime: time1,
      opponentTime: time2,
      reason: ps1.finishReason,
      opponentReason: ps2.finishReason,
    };

    const result2Payload: GameResultPayload = {
      result: result2,
      myScore: ps2.score,
      opponentScore: ps1.score,
      myTime: time2,
      opponentTime: time1,
      reason: ps2.finishReason,
      opponentReason: ps1.finishReason,
    };

    const socket1 = this.server.sockets.sockets.get(ps1.socketId);
    const socket2 = this.server.sockets.sockets.get(ps2.socketId);

    if (socket1) {
      socket1.emit('game:result', result1Payload);
    }
    if (socket2) {
      socket2.emit('game:result', result2Payload);
    }

    this.matchService.releasePlayersFromRoom(roomId);

    setTimeout(() => {
      this.matchService.removeRoom(roomId);
    }, 5000);
  };

  private cleanupRoom = (roomId: string): void => {
    const room = this.matchService.getRoom(roomId);
    if (!room) {
      return;
    }

    const gameTimer = this.gameTimers.get(roomId);
    if (gameTimer) {
      clearTimeout(gameTimer);
      this.gameTimers.delete(roomId);
    }
    this.stopTickTimer(roomId);

    for (const [, playerState] of room.players) {
      const playerSocket = this.server.sockets.sockets.get(playerState.socketId);
      if (playerSocket) {
        playerSocket.emit('error', {
          code: 'MATCH_ABORTED',
          message: 'Opponent disconnected during countdown',
        });
      }
    }

    this.matchService.releasePlayersFromRoom(roomId);
    this.matchService.removeRoom(roomId);
  };
}
