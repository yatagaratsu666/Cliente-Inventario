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
 * Componente Angular que gestiona y visualiza la lista de salas de batalla disponibles.
 */
@Component({
  selector: 'app-rooms-list',
  standalone: true,
  templateUrl: './rooms-list.component.html',
  styleUrls: ['./rooms-list.component.css'],
  imports: [CommonModule, ReactiveFormsModule, AppChatComponent]
})
export class RoomsListComponent implements OnInit {
  rooms: any[] = [];
  playerId: string = localStorage.getItem('username') || '';
  showModal = false;
  roomForm!: FormGroup;

  constructor(
    private battleService: BattleService,
    private router: Router,
    private fb: FormBuilder,
    private toast: ToastService,
    private chatService: ChatService
  ) {}

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

  loadRooms(): void {
    this.battleService.getRooms().subscribe(data => {
      this.rooms = data;
    });
  }

  openModal(): void {
    this.showModal = true;
  }

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

        // ⚡ Ahora esperamos a tener los stats reales antes de unirnos
        this.joinRoom(roomId);
      });
    }
  }

  /**
   * Intenta unir al jugador a una sala existente, usando datos de BD (UsuarioService).
   */
  joinRoom(roomId: string) {
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

  getMaxPlayers(mode: string): number {
    switch (mode) {
      case '1v1': return 2;
      case '2v2': return 4;
      case '3v3': return 6;
      default: return 0;
    }
  }
}
