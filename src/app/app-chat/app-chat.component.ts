import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { io, Socket } from 'socket.io-client';

type Role = 'me' | 'other' | 'system';

interface ChatMessage {
  user: string;
  message: string;
  ts: number;   // epoch ms
  role: Role;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  templateUrl: './app-chat.component.html',
  styleUrls: ['./app-chat.component.css'],
  imports: [CommonModule, FormsModule],
})
export class AppChatComponent implements OnInit, OnDestroy {
  /** URL del backend de sockets */
  @Input() serverUrl = 'http://localhost:4000';

  /** Usuario actual (si no se pasa, intenta leer de localStorage) */
  @Input() myPlayerId: string = localStorage.getItem('username') || 'Anon';

  /** Habilitar/deshabilitar la entrada de texto */
  @Input() canChat = true;

  /** Ref para autoscroll del feed */
  @ViewChild('listRef') listRef!: ElementRef<HTMLDivElement>;

  messages: ChatMessage[] = [];
  chatInput = '';

  private socket!: Socket;

  // Handlers para poder desuscribir en ngOnDestroy
  private handlers = {
    connect: () => this.onConnect(),
    disconnect: (_reason: string) => this.onDisconnect(),
    global: (payload: { user: string; message: string }) =>
      this.push({
        user: payload.user,
        message: payload.message,
        ts: Date.now(),
        role: payload.user === this.myPlayerId ? 'me' : 'other',
      }),
  };

  ngOnInit(): void {
    if (!this.myPlayerId) {
      this.myPlayerId = localStorage.getItem('username') || 'Anon';
    }

    // Conexión Socket.IO
    this.socket = io(this.serverUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });

    // Suscripción a eventos
    this.socket.on('connect', this.handlers.connect);
    this.socket.on('disconnect', this.handlers.disconnect);
    this.socket.on('chat:global', this.handlers.global);
  }

  ngOnDestroy(): void {
    if (!this.socket) return;
    this.socket.off('connect', this.handlers.connect);
    this.socket.off('disconnect', this.handlers.disconnect);
    this.socket.off('chat:global', this.handlers.global);
    this.socket.disconnect();
  }

  // ---- Ciclo de socket ----
  private onConnect() {
    // Tu backend ya hace socket.join('global') al conectar; no hay que emitir nada aquí.
  }

  private onDisconnect() {
    // Podrías mostrar estado si quieres
  }

  // ---- UI handlers ----
  onKeydown(e: KeyboardEvent) {
    // Enter envía; Shift+Enter hace salto de línea
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.send();
    }
  }

  send() {
    const text = (this.chatInput || '').trim();
    if (!text || !this.canChat || !this.socket?.connected) return;

    // Emitir a global
    this.socket.emit('chat:global', {
      playerId: this.myPlayerId,
      msg: text,
    });

    // Eco local para feedback inmediato
    this.push({
      user: this.myPlayerId,
      message: text,
      ts: Date.now(),
      role: 'me',
    });

    this.chatInput = '';
  }

  // ---- Helpers ----
  private push(m: ChatMessage) {
    this.messages = [...this.messages, m];
    // Autoscroll
    setTimeout(() => {
      const el = this.listRef?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 0);
  }
}