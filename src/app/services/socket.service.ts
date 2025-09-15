import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../environment/environment';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket?: Socket;

  connect(token?: string): Socket {
    // asume environment.socket.base está definido
    const url = environment.socket?.base || environment.api?.base || '';
    this.socket = io(url, {
      auth: { token },
      transports: ['websocket', 'polling']
    });
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = undefined;
    }
  }

  getSocket() {
    return this.socket;
  }
}
