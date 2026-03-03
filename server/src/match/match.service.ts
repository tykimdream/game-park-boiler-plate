import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { type Difficulty } from '../../../shared/types/game';
import { type PlayerState, type QueueEntry, type Room } from '../types/server-types';

@Injectable()
export class MatchService {
  private readonly rooms: Map<string, Room> = new Map();
  private readonly playerRoomMap: Map<string, string> = new Map();

  createRoom = (difficulty: Difficulty, player1: QueueEntry, player2: QueueEntry): Room => {
    const roomId = randomUUID();

    const createPlayerState = (entry: QueueEntry): PlayerState => ({
      userId: entry.userId,
      nickname: entry.nickname,
      socketId: entry.socketId,
      gameData: {},
      status: 'idle',
      finishReason: 'none',
      startTime: 0,
      endTime: null,
      score: 0,
    });

    const room: Room = {
      id: roomId,
      difficulty,
      players: new Map([
        [player1.userId, createPlayerState(player1)],
        [player2.userId, createPlayerState(player2)],
      ]),
      createdAt: Date.now(),
      startedAt: null,
      finishedAt: null,
    };

    this.rooms.set(roomId, room);
    this.playerRoomMap.set(player1.userId, roomId);
    this.playerRoomMap.set(player2.userId, roomId);

    return room;
  };

  getRoom = (roomId: string): Room | undefined => {
    return this.rooms.get(roomId);
  };

  getRoomByPlayerId = (userId: string): Room | undefined => {
    const roomId = this.playerRoomMap.get(userId);
    if (!roomId) {
      return undefined;
    }
    return this.rooms.get(roomId);
  };

  releasePlayersFromRoom = (roomId: string): void => {
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }
    for (const [userId] of room.players) {
      this.playerRoomMap.delete(userId);
    }
  };

  removeRoom = (roomId: string): void => {
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }
    for (const [userId] of room.players) {
      this.playerRoomMap.delete(userId);
    }
    this.rooms.delete(roomId);
  };

  getPlayerState = (roomId: string, userId: string): PlayerState | undefined => {
    const room = this.rooms.get(roomId);
    if (!room) {
      return undefined;
    }
    return room.players.get(userId);
  };

  isPlayerInRoom = (userId: string): boolean => {
    return this.playerRoomMap.has(userId);
  };

  updatePlayerState = (roomId: string, userId: string, updates: Partial<PlayerState>): void => {
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }
    const player = room.players.get(userId);
    if (!player) {
      return;
    }
    Object.assign(player, updates);
  };

  checkBothFinished = (roomId: string): boolean => {
    const room = this.rooms.get(roomId);
    if (!room) {
      return false;
    }
    const players = [...room.players.values()];
    if (players.length !== 2) {
      return false;
    }
    return players.every((player) => player.status === 'won' || player.status === 'lost');
  };
}
