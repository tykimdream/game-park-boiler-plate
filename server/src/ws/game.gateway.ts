import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  type ClientToServerEvents,
  type ServerToClientEvents,
  type QueueJoinPayload,
  type QueueLeavePayload,
} from '../../../shared/types/ws-events';

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: TypedServer;

  handleConnection(client: TypedSocket): void {
    const { userId, nickname } = client.handshake.auth as {
      userId: string;
      nickname: string;
    };
    console.warn(`[WS] Connected: ${userId} (${nickname})`);
  }

  handleDisconnect(client: TypedSocket): void {
    console.warn(`[WS] Disconnected: ${client.id}`);
  }

  @SubscribeMessage('queue:join')
  handleQueueJoin(client: TypedSocket, payload: QueueJoinPayload): void {
    // 매칭 큐 참가 로직 구현
    client.emit('queue:joined', { position: 1 });
  }

  @SubscribeMessage('queue:leave')
  handleQueueLeave(client: TypedSocket, payload: QueueLeavePayload): void {
    // 매칭 큐 이탈 로직 구현
    client.emit('queue:left', { userId: payload.userId });
  }

  @SubscribeMessage('game:forfeit')
  handleForfeit(client: TypedSocket, payload: { matchId: string }): void {
    // 게임 포기 로직 구현
  }
}
