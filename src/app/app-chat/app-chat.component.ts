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

/** Rol visual de cada mensaje en el chat (para estilos/alineación) */
type Role = 'me' | 'other' | 'system';

/** Estructura de un mensaje del chat */
interface ChatMessage {
  user: string;     // autor (apodo/username)
  message: string;  // contenido del mensaje
  ts: number;       // timestamp epoch (ms) para mostrar hora HH:mm
  role: Role;       // rol de presentación (me/other/system)
}

/**
 * AppChatComponent
 *
 * Componente standalone que implementa el **chat global** (lobby) como
 * panel lateral. Se conecta vía **Socket.IO** al backend y:
 * - Escucha `chat:global` para renderizar mensajes entrantes
 * - Emite `chat:global` con `{ playerId, msg }` al enviar
 *
 * Notas:
 * - No depende de servicios externos; maneja el socket dentro del componente
 * - Usa `FormsModule` para el textarea [(ngModel)]
 * - Implementa autoscroll al final cada vez que llega/manda un mensaje
 */
@Component({
  selector: 'app-chat',
  standalone: true,
  templateUrl: './app-chat.component.html',
  styleUrls: ['./app-chat.component.css'],
  imports: [CommonModule, FormsModule],
})
export class AppChatComponent implements OnInit, OnDestroy {
  /** URL del backend de sockets*/
  @Input() serverUrl = 'http://34.71.235.33:4000';

  /** Canal de comunicación de los sockets */
  @Input() channel: 'global' | `battle-${string}` = 'global';


  /**
   * Usuario actual. Si no se provee desde fuera, se intenta leer
   * de `localStorage('username')`. Se usa para:
   * - diferenciar rol 'me' vs 'other'
   * - enviar `playerId` al backend al emitir `chat:global`
   */
  @Input() myPlayerId: string = localStorage.getItem('username') || 'Anon';

  /** Bandera para habilitar/deshabilitar la entrada y el botón de enviar */
  @Input() canChat = true;

  /**
   * Referencia al contenedor scrollable de la lista de mensajes.
   * Se usa para hacer **autoscroll** al final cuando cambian los mensajes.
   */
  @ViewChild('listRef') listRef!: ElementRef<HTMLDivElement>;

  /** Estado local del feed de mensajes (histórico + nuevos) */
  messages: ChatMessage[] = [];

  /** Modelo del textarea (entrada de usuario) */
  chatInput = '';

  /** Instancia de Socket.IO (cliente) */
  private socket!: Socket;

  /**
   * Handlers centralizados para poder desuscribir fácilmente en `ngOnDestroy`.
   * - connect: callback al conectarse
   * - disconnect: callback al desconectarse
   * - global: receptor de payloads de `chat:global` emitidos por el backend
   */
  private handlers = {
    connect: () => this.onConnect(),
    disconnect: (_reason: string) => this.onDisconnect(),

    // manejador genérico para cualquier canal
    message: (payload: { user: string; message: string }) => {
      if (payload.user === this.myPlayerId) return;
      this.push({
        user: payload.user,
        message: payload.message,
        ts: Date.now(),
        role: payload.user === this.myPlayerId ? 'me' : 'other',
      });
    },

    system: (msg: string) => {
      this.push({
        user: 'system',
        message: msg,
        ts: Date.now(),
        role: 'system',
      });
    }
  };

  getChatName(): string {
    return this.channel === 'global' ? 'Chat Global' : 'Chat de Batalla ' + this.channel.replace('battle-', '');
  }

  /**
   * Ciclo de vida: OnInit
   * - Asegura `myPlayerId`
   * - Crea la conexión Socket.IO
   * - Registra listeners a eventos del socket
   */
  ngOnInit(): void {
    if (!this.myPlayerId) {
      this.myPlayerId = localStorage.getItem('username') || 'Anon';
    }


    this.socket = io(this.serverUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', this.handlers.connect);
    this.socket.on('disconnect', this.handlers.disconnect);

    // suscribir dinámicamente al canal
    const eventName = this.channel === 'global' ? 'chat:global' : 'chat:battle';
    this.socket.on(eventName, this.handlers.message);

    // sistema (solo útil en batallas)
    this.socket.on('system', this.handlers.system);

    // si es batalla, avisamos al backend
    if (this.channel.startsWith('battle-')) {
      const battleId = this.channel.replace('battle-', '');
      this.socket.emit('join:battle', {
        playerId: this.myPlayerId,
        battleId,
      });
    }
  }


  /**
   * Ciclo de vida: OnDestroy
   * - Desregistra listeners
   * - Cierra la conexión del socket
   */
  ngOnDestroy(): void {
    if (!this.socket) return;
    this.socket.off('connect', this.handlers.connect);
    this.socket.off('disconnect', this.handlers.disconnect);
    this.socket.disconnect();
  }

  // ──────────────────────────────
  //  Ciclo del socket / estado
  // ──────────────────────────────

  /** Callback al conectar. El backend ya realiza `socket.join('global')`. */
  private onConnect() {
    // Aquí podrías setear estados de “online”, reintentos, etc.
  }

  /** Callback al desconectar (placeholder para mostrar estado si se requiere). */
  private onDisconnect() {
    // Aquí podrías notificar “desconectado” o intentar reconexión manual.
  }

  // ──────────────────────────────
  //  Interacción de UI
  // ──────────────────────────────

  /**
   * Maneja la pulsación de teclas en el textarea.
   * - Enter (sin Shift) → Enviar mensaje
   * - Shift+Enter → salto de línea
   */
  onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.send();
    }
  }

  /**
   * Envía el contenido del textarea al backend (`chat:global`) y
   * agrega un **eco local** para feedback inmediato.
   *
   * Reglas:
   * - No envía si `chatInput` está vacío/espacios
   * - Respeta `canChat`
   * - Verifica que el socket esté conectado
   */
  send() {
    const text = (this.chatInput || '').trim();
    if (!text || !this.canChat || !this.socket?.connected) return;

    if (this.channel === 'global') {
      this.socket.emit('chat:global', {
        playerId: this.myPlayerId,
        msg: text,
      });
    } else {
      const battleId = this.channel.replace('battle-', '');
      this.socket.emit('chat:battle', {
        battleId,
        playerId: this.myPlayerId,
        message: text,
      });
    }

    this.push({
      user: this.myPlayerId,
      message: text,
      ts: Date.now(),
      role: 'me',
    });

    this.chatInput = '';
  }


  // ──────────────────────────────
  //  Utilidades internas
  // ──────────────────────────────

  /**
   * Inserta un mensaje al final del feed y hace **autoscroll** al último.
   * @param m Mensaje a insertar
   */
  private push(m: ChatMessage) {
    // Inmutabilidad simple para disparar detección de cambios
    this.messages = [...this.messages, m];

    // Autoscroll al final en el siguiente tick de render
    setTimeout(() => {
      const el = this.listRef?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 0);
  }
}