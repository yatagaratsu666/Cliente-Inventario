import { Component } from '@angular/core';

/**
 * GlobalChatComponent
 *
 * Componente Angular encargado de manejar el chat global dentro del juego.
 *
 * Contexto:
 * - Esta clase representa la UI para que los jugadores puedan comunicarse globalmente,
 *   es decir, no dentro de una batalla específica sino con todos los usuarios conectados.
 * - Su función es renderizar el historial de mensajes y
 *   hacer uso de un input para escribir mensajes nuevos que se enviarán a través del ChatService.
 *
 */

@Component({
  selector: 'app-global-chat',
  imports: [],
  templateUrl: './global-chat.component.html',
  styleUrl: './global-chat.component.css'
})
export class GlobalChatComponent {

}
