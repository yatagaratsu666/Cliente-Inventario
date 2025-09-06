// room-lobby.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BattleService } from '../services/battle.service';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

/**
 * RoomLobbyComponent
 *
 * Componente Angular que gestiona el lobby de una sala de batalla (pre-combate).
 * Su objetivo es manejar la lógica previa a que inicie la batalla, incluyendo:
 * - Obtener el ID de la sala desde la URL.
 * - Consultar y almacenar las estadísticas del héroe del jugador.
 * - Escuchar el evento `battleStarted` para redirigir al componente de batalla cuando sea necesario.
 * - Permitir que el jugador indique que está listo (`onReady`).
 * - Gestionar las suscripciones a eventos para evitar memory leaks (`ngOnDestroy`).
 *
 * Flujo básico:
 * 1. Cuando el componente se inicializa, obtiene `roomId` desde la ruta.
 * 2. Usa `BattleService` para recuperar estadísticas del héroe según el jugador actual.
 * 3. Se suscribe a `battleStarted` para detectar cuando inicia la batalla y redirigir a `/battle/:id`.
 * 4. Ofrece un método `onReady()` para notificar al servidor que el jugador está listo.
 * 5. Limpia todas las suscripciones al destruirse para no dejar listeners colgados.
 */

@Component({
  selector: 'app-room-lobby',
  templateUrl: './rooms-lobby.component.html',
  styleUrls: ['./rooms-lobby.component.css'],
  imports: [CommonModule, FormsModule]
})
export class RoomLobbyComponent implements OnInit, OnDestroy {
  // ID de la sala actual extraído de la URL
  roomId!: string;
  // Lista de jugadores en la sala (puede ser usada para mostrar en el template)
  players: any[] = [];
  // Estadísticas del héroe del jugador actual
  heroStats: any;
  // ID del jugador actual (obtenido del localStorage)
  id: string = localStorage.getItem('username') || '';
  // Equipo del jugador (puede ser 'A' o 'B', por defecto 'A')
  team: string = 'A';
  // Array para almacenar las suscripciones y limpiarlas en ngOnDestroy
  private subs: Subscription[] = [];
  constructor(private route: ActivatedRoute, private router: Router, private battleService: BattleService) {}

  ngOnInit() {
    // Obtiene el ID de la sala desde la ruta
    this.roomId = this.route.snapshot.paramMap.get('id') || '';
    // Carga las estadísticas del héroe del jugador actual
    this.heroStats = this.battleService.getHeroStatsByPlayerId(this.id)

    // Se suscribe al evento battleStarted para detectar inicio de la batalla
    const battleSub = this.battleService.listen<any>("battleStarted").subscribe(event => {
      this.battleService.setCurrentBattle(event);
      this.battleService.joinBattle(this.roomId, this.id);
      this.router.navigate([`/battle/${this.roomId}`]);
    });

    this.subs.push(battleSub);
  }

  
  // Notifica al servidor que el jugador está listo para iniciar la batalla
  onReady() {
    this.battleService.onReady(this.roomId, this.id, this.heroStats, this.team);
  }
  // Limpia todas las suscripciones para evitar memory leaks
  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }
}
