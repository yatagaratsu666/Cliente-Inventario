import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BattleService } from '../services/battle.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AppChatComponent } from '../app-chat/app-chat.component';

/**
 * Componente Angular que gestiona y visualiza la lista de salas de batalla disponibles.
 *
 * Funcionalidades principales:
 * - Muestra todas las salas activas obtenidas desde el `BattleService`.
 * - Permite al jugador unirse a salas existentes.
 * - Crea nuevas salas mediante un formulario reactivo.
 * - Redirige al jugador a la sala correspondiente una vez creada o unida.
 *
 * Características:
 * - Uso de `ReactiveFormsModule` para manejar el formulario de creación de salas.
 * - Control dinámico de visibilidad del formulario (`showForm`).
 * - Cálculo de capacidad máxima de jugadores según el modo de la sala.
 */
@Component({
  selector: 'app-rooms-list',
  standalone: true, // Componente standalone para poder importar directamente otros standalone (AppChatComponent)
  templateUrl: './rooms-list.component.html',
  styleUrls: ['./rooms-list.component.css'],
  imports: [CommonModule, ReactiveFormsModule, AppChatComponent] // Se importa el chat global para usarlo en el template
})
export class RoomsListComponent implements OnInit {
  // Lista de salas obtenidas del servicio
  rooms: any[] = [];
  // ID del jugador actual 
  playerId: string = localStorage.getItem('username') || '';
  // Controla la visibilidad del formulario de creación de salas
  showModal = false;

  /** Formulario reactivo para crear nuevas salas */
  roomForm!: FormGroup;

  constructor(private battleService: BattleService, private router: Router, private fb: FormBuilder) { }

  /**
   * Hook de inicialización del componente.
   * - Carga las salas disponibles.
   * - Configura el formulario reactivo de creación de salas.
   */
  ngOnInit(): void {
    this.loadRooms();

    this.roomForm = this.fb.group({
      id: [''],
      mode: ['1v1'],
      allowAI: [false],
      credits: [100],
      heroLevel: [1],
      ownerId: [this.playerId]
    });
  }

  /**
   * Carga la lista de salas disponibles desde el servicio.
   */
  loadRooms(): void {
    this.battleService.getRooms().subscribe(data => {
      this.rooms = data;
    });
  }

  /**
   * Activa el modal para crear una nueva sala.
   */
  openModal(): void {
    this.showModal = true;
  }

  /**
   * Cierra el modal de creación de sala.
   */
  closeModal(): void {
    this.showModal = false;
    this.roomForm.reset();
  }

  /**
 * Envía el formulario para crear una nueva sala.
 * Si la creación es exitosa, refresca la lista de salas, reinicia el formulario
 * y automáticamente intenta unir al jugador a la sala recién creada.
 */
  createRoomSubmit() {
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
      });
      this.joinRoom(roomId);
    }
  }

  /**
  * Intenta unir al jugador a una sala existente, usando sus datos de héroe.
  * Si el proceso es exitoso, navega a la vista de la sala.
  * Si falla, muestra un error en consola y alerta al usuario.
  */
  joinRoom(roomId: string) {
    const hero = this.battleService.getHeroStatsByPlayerId(this.playerId);
    this.battleService.joinRoom(roomId, this.playerId, hero.hero.level, hero).subscribe({
      next: () => {
        this.router.navigate(['/rooms', roomId]);
      },
      error: (err) => {
        console.error('Error al unirse a la sala:', err);
        const message = err.error?.error || 'Ocurrió un error inesperado';
        alert(message);
      }
    });
  }

    /**
   * Devuelve la cantidad máxima de jugadores según el modo seleccionado
   * @param mode Modo de juego (e.g. "1v1", "2v2", "3v3")
   * @returns Número máximo de jugadores permitido en ese modo
   */
  getMaxPlayers(mode: string): number {
    switch (mode) {
      case "1v1":
        return 2;
      case "2v2":
        return 4;
      case "3v3":
        return 6;
      default:
        return 0;
    }
  }



}
