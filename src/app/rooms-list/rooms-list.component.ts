
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BattleService } from '../services/battle.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AppChatComponent } from '../app-chat/app-chat.component';
import { ToastService } from '../services/toast.service';
import { ChatService } from '../services/chat.service';

/**
 * RoomsListComponent
 *
 * Componente encargado de gestionar y mostrar la lista de salas de batalla disponibles.
 * Permite crear nuevas salas, unirse a ellas y mantener la lista actualizada en tiempo real
 * mediante WebSockets y el servicio de chat.
 *
 * Responsabilidades principales:
 * - Mostrar las salas de batalla existentes.
 * - Permitir la creación de nuevas salas.
 * - Escuchar actualizaciones en tiempo real sobre las salas.
 * - Conectar al jugador a una sala específica.
 *
 * @property {any[]} rooms - Lista de salas de batalla disponibles.
 * @property {string} playerId - Nombre de usuario del jugador actual (obtenido del localStorage).
 * @property {boolean} showModal - Controla la visibilidad del modal de creación de sala.
 * @property {FormGroup} roomForm - Formulario reactivo para la creación de salas.
 */@Component({
  selector: 'app-rooms-list',
  standalone: true,
  templateUrl: './rooms-list.component.html',
  styleUrls: ['./rooms-list.component.css'],
  imports: [CommonModule, ReactiveFormsModule, AppChatComponent]
})
export class RoomsListComponent implements OnInit {

  /** Lista de salas disponibles */
  rooms: any[] = [];

  /** Nombre del jugador actual (obtenido desde localStorage) */
  playerId: string = localStorage.getItem('username') || '';

  /** Controla la visibilidad del modal para crear sala */
  showModal: boolean = false;

  /** Formulario reactivo para creación de sala */
  roomForm!: FormGroup;

  /**
   * Constructor del componente.
   * @param {BattleService} battleService Servicio para manejar las operaciones de salas y batallas.
   * @param {Router} router Servicio de enrutamiento de Angular.
   * @param {FormBuilder} fb Servicio para crear formularios reactivos.
   * @param {ToastService} toast Servicio para mostrar notificaciones.
   * @param {ChatService} chatService Servicio encargado de la comunicación en tiempo real.
   */
  constructor(
    private battleService: BattleService,
    private router: Router,
    private fb: FormBuilder,
    private toast: ToastService,
    private chatService: ChatService
  ) { }

  /**
   * Inicializa el componente conectando al servicio de chat
   * y configurando el formulario de creación de salas.
   *
   * @returns {void}
   */
  ngOnInit(): void {
    this.chatService.connect(); // Conectar al socket para actualizaciones
    this.loadRooms();

    this.roomForm = this.fb.group({
      id: [''],
      mode: ['1v1'],
      allowAI: [false],
      credits: [0],
      heroLevel: [1],
      ownerId: [this.playerId]
    });

    // Suscribirse a actualizaciones de salas vía WebSocket
    this.chatService.listenRoomsUpdate().subscribe(() => {
      this.loadRooms();
    });
  }

  /**
   * Carga la lista de salas desde el backend.
   *
   * @returns {void}
   */
  loadRooms(): void {
    this.battleService.getRooms().subscribe(data => {
      this.rooms = data;
    });
  }

  /**
   * Abre el modal de creación de una nueva sala.
   *
   * @returns {void}
   */
  openModal(): void {
    this.showModal = true;
  }

  /**
   * Cierra el modal de creación y reinicia los valores del formulario.
   *
   * @returns {void}
   */
  closeModal(): void {
    this.showModal = false;
    this.roomForm.reset(
      {
        mode: '1v1',
        allowAI: false,
        credits: 0,
        heroLevel: 1,
        ownerId: this.playerId
      }
    );
  }

  /**
   * Envía los datos del formulario para crear una nueva sala.
   * Una vez creada, la lista se actualiza y el usuario es unido a la sala.
   *
   * @returns {void}
   */
  createRoomSubmit(): void {
    if (this.roomForm.valid) {
      const roomId = this.roomForm.get('id')?.value;
      this.battleService.createRoom(this.roomForm.value).subscribe(() => {
        this.loadRooms();
        this.showModal = false;
        this.roomForm.reset({
          mode: '1v1',
          allowAI: false,
          credits: 100,
          heroLevel: 1,
          ownerId: this.playerId
        });

        // ⚡ Ahora esperamos a tener los stats reales antes de unirnos
        this.joinRoom(roomId);
      });
    }
  }

  /**
   * Intenta unir al jugador a una sala existente, usando sus estadísticas de héroe.
   *
   * @param {string} roomId - ID de la sala a la que se unirá el jugador.
   * @returns {void}
   */
  joinRoom(roomId: string): void {
    this.chatService.sendRoomsUpdate(); // Notificar a otros usuarios que la lista de salas ha cambiado
    this.battleService.getHeroStatsByPlayerId(this.playerId).subscribe({
      next: (heroStats) => {
        this.battleService
          .joinRoom(roomId, this.playerId, heroStats.hero.level, heroStats)
          .subscribe({
            next: () => {
              this.router.navigate(['/rooms', roomId]);
            },
            error: (err) => {
              console.error('Error al unirse a la sala:', err);
              const message = err.error?.error || 'Ocurrió un error inesperado';
              this.toast.error(`No se pudo unir a la sala: ${message}`);
            }
          });
      },
      error: (err) => {
        console.error('No se pudieron obtener los stats del héroe:', err);
        this.toast.error('Error cargando héroe. Héroe no equipado o inválido.');
      }
    });
  }

  /**
   * Obtiene el número máximo de jugadores permitidos según el modo de batalla.
   *
   * @param {string} mode - Modo de la batalla (1v1, 2v2, 3v3).
   * @returns {number} Número máximo de jugadores.
   */
  getMaxPlayers(mode: string): number {
    switch (mode) {
      case '1v1': return 2;
      case '2v2': return 4;
      case '3v3': return 6;
      default: return 0;
    }
  }
}
