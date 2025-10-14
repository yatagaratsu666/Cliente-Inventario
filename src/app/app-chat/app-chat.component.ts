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
  user: string;
  message: string;
  ts: number;
  role: Role;
}

/**
 * AppChatComponent
 *
 * Componente que implementa el chat global o de batalla del juego.
 * Se conecta al backend mediante **Socket.IO** para enviar y recibir mensajes en tiempo real.
 *
 * Responsabilidades:
 * - Escuchar y renderizar mensajes recibidos (`chat:global`, `chat:battle`)
 * - Emitir mensajes escritos por el usuario
 * - Manejar autoscroll del chat
 * - Unirse automáticamente al canal de batalla correspondiente
 *
 * @property {string} serverUrl - URL del backend de sockets.
 * @property {'global' | `battle-${string}`} channel - Canal de comunicación actual.
 * @property {string} myPlayerId - Identificador del usuario actual.
 * @property {boolean} canChat - Habilita o deshabilita la escritura en el chat.
 * @property {ElementRef<HTMLDivElement>} listRef - Referencia al contenedor scrollable del chat.
 * @property {ChatMessage[]} messages - Lista de mensajes actuales en el chat.
 * @property {string} chatInput - Contenido actual del campo de texto.
 * @property {Socket} socket - Instancia del cliente Socket.IO.
 * @property {object} handlers - Manejadores de eventos del socket.
 */
@Component({
  selector: 'app-chat',
  standalone: true,
  templateUrl: './app-chat.component.html',
  styleUrls: ['./app-chat.component.css'],
  imports: [CommonModule, FormsModule],
})
export class AppChatComponent implements OnInit, OnDestroy {

  /** URL del backend de sockets */
  serverUrl = 'http://34.44.126.114:4000';

  /** Canal de comunicación actual (global o de batalla) */
  @Input() channel: 'global' | `battle-${string}` = 'global';

  /**
   * Identificador del usuario actual.
   * Si no se proporciona, se obtiene de `localStorage('username')`.
   */
  @Input() myPlayerId: string = localStorage.getItem('username') || 'Anon';

  /** Controla si el usuario puede enviar mensajes */
  @Input() canChat = true;

  /**
   * Referencia al contenedor de mensajes del chat.
   * Se usa para aplicar autoscroll al recibir/enviar mensajes.
   */
  @ViewChild('listRef') listRef!: ElementRef<HTMLDivElement>;

  /** Lista de mensajes del chat */
  messages: ChatMessage[] = [];

  /** Texto actual del área de entrada */
  chatInput = '';

  /** Instancia activa del cliente Socket.IO */
  private socket!: Socket;

  /**
   * Manejadores de eventos del socket para conexión, desconexión y recepción de mensajes.
   * Permiten registrar y desuscribir callbacks fácilmente.
   */
  private handlers = {
    connect: () => this.onConnect(),
    disconnect: (_reason: string) => this.onDisconnect(),

    // Manejador de mensajes recibidos
    message: (payload: { user: string; message: string }) => {
      if (payload.user === this.myPlayerId) return;
      this.push({
        user: payload.user,
        message: payload.message,
        ts: Date.now(),
        role: payload.user === this.myPlayerId ? 'me' : 'other',
      });
    },

    // Manejador de mensajes del sistema
    system: (msg: string) => {
      this.push({
        user: 'system',
        message: msg,
        ts: Date.now(),
        role: 'system',
      });
    }
  };

  /**
   * Obtiene el nombre del canal de chat para mostrar en la interfaz.
   * @returns {string} Nombre legible del chat.
   */
  getChatName(): string {
    return this.channel === 'global'
      ? 'Chat Global'
      : 'Chat de Batalla ' + this.channel.replace('battle-', '');
  }

  /**
   * Ciclo de vida: OnInit
   *
   * - Asegura la obtención del `myPlayerId`
   * - Inicializa la conexión Socket.IO
   * - Registra los listeners de eventos
   * @returns {void}
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

    const eventName = this.channel === 'global' ? 'chat:global' : 'chat:battle';
    this.socket.on(eventName, this.handlers.message);

    this.socket.on('system', this.handlers.system);

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
   *
   * - Elimina los listeners del socket
   * - Cierra la conexión de Socket.IO
   * @returns {void}
   */
  ngOnDestroy(): void {
    if (!this.socket) return;
    this.socket.off('connect', this.handlers.connect);
    this.socket.off('disconnect', this.handlers.disconnect);
    this.socket.disconnect();
  }

  /** Callback ejecutado al conectar con el servidor de sockets */
  private onConnect(): void {
    // Puede usarse para indicar estado "en línea" o inicializar variables
  }

  /** Callback ejecutado al desconectarse del servidor de sockets */
  private onDisconnect(): void {
    // Puede emplearse para mostrar un estado "desconectado"
  }

  /**
   * Maneja las teclas presionadas en el textarea.
   * Envía el mensaje si se presiona Enter sin Shift.
   * @param {KeyboardEvent} e - Evento del teclado.
   * @returns {void}
   */
  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.send();
    }
  }

  /**
   * Envía el mensaje actual del usuario al backend y lo agrega al feed local.
   *
   * Reglas:
   * - Ignora entradas vacías o con solo espacios.
   * - Verifica que `canChat` esté habilitado.
   * - No envía si el socket está desconectado.
   *
   * @returns {void}
   */
  send(): void {
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

  /**
   * Inserta un mensaje al final de la lista y realiza autoscroll hacia abajo.
   * @param {ChatMessage} m - Mensaje a agregar.
   * @returns {void}
   */
  private push(m: ChatMessage): void {
    this.messages = [...this.messages, m];
    setTimeout(() => {
      const el = this.listRef?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 0);
  }
}
