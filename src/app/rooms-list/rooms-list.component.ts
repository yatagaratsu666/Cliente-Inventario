// rooms-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BattleService } from '../services/battle.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

/**
 * RoomsListComponent
 *
 * Componente Angular para gestionar y visualizar la lista de salas de batalla disponibles.
 * Se encarga de:
 * - Mostrar todas las salas activas obtenidas desde el `BattleService`
 * - Permitir al jugador unirse a salas existentes
 * - Crear nuevas salas con parámetros configurables a través de un formulario
 * - Redirigir al jugador a la sala correspondiente una vez creada o unida
 *
 * Características:
 * - Uso de ReactiveForms para manejar el formulario de creación de salas
 * - Lógica para mostrar/ocultar el formulario dinámicamente (`showForm`)
 * - Cálculo de capacidad máxima de jugadores según el modo de la sala
 */

@Component({
  selector: 'app-rooms-list',
  templateUrl: './rooms-list.component.html',
  styleUrls: ['./rooms-list.component.css'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class RoomsListComponent implements OnInit {
  // Lista de salas obtenidas del servicio
  rooms: any[] = [];
  // ID del jugador actual 
  playerId: string = localStorage.getItem('username') || '';
  // Controla la visibilidad del formulario de creación de salas
  showForm = false;
  roomForm!: FormGroup;

  constructor(private battleService: BattleService, private router: Router, private fb: FormBuilder) { }

  // Inicializa el componente cargando las salas y configurando el formulario reactivo
  ngOnInit() {
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

  // Carga la lista de salas disponibles desde el servicio
  loadRooms() {
    this.battleService.getRooms().subscribe(data => {
      this.rooms = data;
    });
  }

  // Alterna la visibilidad del formulario de creación de salas
  toggleForm() {
    this.showForm = !this.showForm;
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
        this.showForm = false;
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
        console.error("Error al unirse a la sala:", err);
        const message = err.error?.error || "Ocurrió un error inesperado";
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
