// socket.service.ts
import { Injectable } from "@angular/core";
import { io, Socket } from "socket.io-client";
import { Observable } from "rxjs";
import { ApiConfigService } from './api.config.service';

/**
 * ChatService
 *
 * Servicio Angular encargado de manejar la conexión en tiempo real con el servidor
 * a través de Socket.IO para el sistema de chat y comunicación entre jugadores.
 *
 * Funcionalidades principales:
 * - Establecer y cerrar la conexión WebSocket.
 * - Enviar y recibir mensajes globales.
 * - Enviar y recibir mensajes dentro de batallas (lobbies específicos).
 * - Unirse a lobbies de batalla.
 *
 * Este servicio actúa como puente entre la app Angular y el servidor de chat,
 */

@Injectable({ providedIn: "root" })
export class ChatService {
  private socket: Socket | null = null;

  constructor(private apiConfigService: ApiConfigService) {}

    /**
   * Establece la conexión con el servidor de chat usando la URL
   * proporcionada por ApiConfigService. Si ya existe una conexión,
   * reutiliza la misma.
   * @returns {Socket} instancia activa del socket
   */
  connect() {
    if (!this.socket) {
      console.log(this.apiConfigService.getChatUrl());
      this.socket = io(this.apiConfigService.getChatUrl());
    }
    return this.socket;
  }

    /**
   * Obtiene la instancia actual del socket (si existe).
   * @returns {Socket | null} socket activo o null si no hay conexión
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Cierra la conexión con el servidor y limpia la instancia del socket.
  */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

    /**
   * Envía un mensaje global a todos los jugadores conectados.
   * @param playerId ID del jugador que envía el mensaje
   * @param msg Contenido del mensaje
   */
  sendMessageGlobal(playerId: string, msg: string) {
    this.socket?.emit("chat:global", { playerId, msg });
  }

  
  /**
   * Escucha los mensajes globales emitidos por otros jugadores.
   * Devuelve un Observable para manejar la recepción reactiva.
   * @returns Observable que emite { user, message }
   */
  listenGlobalMessage(): Observable<{ user: string; message: string }> {
    return new Observable<{ user: string; message: string }>(subscriber => {
      this.socket?.on("chat:global", (data: { user: string; message: string }) => {
        subscriber.next(data);
      });
    });
    }

    sendRoomsUpdate(){
      console.log("Enviando actualización de salas...");
      this.socket?.emit("update:rooms", {});
    }


    listenRoomsUpdate(): Observable<any> {
      return new Observable<any>(subscriber => {
        console.log("Escuchando actualizaciones de salas...");
        this.socket?.on("update:rooms", () => {
          subscriber.next(true);
        });
      });
    }

      /**
   * Une al jugador a un lobby de batalla específico.
   * @param playerId ID del jugador
   * @param battleId ID de la batalla/lobby
   */
    joinBattleLobby(playerId: string, battleId: string) {
      this.socket?.emit("join:battle", { playerId, battleId });
    }

      /**
   * Envía un mensaje dentro de un lobby de batalla.
   * @param playerId ID del jugador que envía el mensaje
   * @param battleId ID de la batalla/lobby
   * @param msg Contenido del mensaje
   */
    sendMessageBattle(playerId: string, battleId: string, msg: string) {
      this.socket?.emit("chat:battle", { playerId, battleId, msg });
    }
}
