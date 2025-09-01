// socket.service.ts
import { Injectable } from "@angular/core";
import { io, Socket } from "socket.io-client";
import { environment } from "../enviroment/enviroment.test";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class ChatService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(environment.chatUrl);
    }
    return this.socket;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendMessageGlobal(playerId: string, msg: string) {
    this.socket?.emit("chat:global", { playerId, msg });
  }

  listenGlobalMessage(): Observable<{ user: string; message: string }> {
    return new Observable<{ user: string; message: string }>(subscriber => {
      this.socket?.on("chat:global", (data: { user: string; message: string }) => {
        subscriber.next(data);
      });
    });
    }

    joinBattleLobby(playerId: string, battleId: string) {
      this.socket?.emit("join:battle", { playerId, battleId });
    }

    sendMessageBattle(playerId: string, battleId: string, msg: string) {
      this.socket?.emit("chat:battle", { playerId, battleId, msg });
    }
}
