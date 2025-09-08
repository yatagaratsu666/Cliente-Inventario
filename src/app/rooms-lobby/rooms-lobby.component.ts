import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BattleService } from '../services/battle.service';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

/**
 * Componente Angular que gestiona el lobby de una sala de batalla (pre-combate).
 *
 * Funcionalidades principales:
 * - Obtiene el ID de la sala desde la URL.
 * - Carga las estadísticas del héroe del jugador.
 * - Escucha el evento `battleStarted` y redirige al componente de batalla.
 * - Permite que el jugador indique que está listo (`onReady`).
 * - Libera suscripciones en `ngOnDestroy` para evitar fugas de memoria.
 */
@Component({
  selector: 'app-room-lobby',
  templateUrl: './rooms-lobby.component.html',
  styleUrls: ['./rooms-lobby.component.css'],
  imports: [CommonModule, FormsModule]
})
export class RoomLobbyComponent implements OnInit, OnDestroy {
  /** ID de la sala actual extraído de la URL */
  roomId!: string;

  /** Lista de jugadores en la sala */
  players: any[] = [];

  /** Estadísticas del héroe del jugador actual */
  heroStats: any;

  /** ID del jugador actual (obtenido del localStorage) */
  id: string = localStorage.getItem('username') || '';

  /** Equipo del jugador (puede ser 'A' o 'B') */
  team: string = 'A';

  /** Suscripciones a observables para limpiar en ngOnDestroy */
  private subs: Subscription[] = [];

  /**
   * Constructor del componente.
   *
   * @param route - Servicio para acceder a parámetros de la ruta.
   * @param router - Servicio de enrutamiento Angular.
   * @param battleService - Servicio que maneja la lógica de batallas.
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private battleService: BattleService
  ) {}

  /**
   * Hook de inicialización del componente.
   * - Obtiene `roomId` desde la ruta.
   * - Recupera las estadísticas del héroe.
   * - Se suscribe al evento `battleStarted` para redirigir al campo de batalla.
   */
  ngOnInit(): void {
    this.roomId = this.route.snapshot.paramMap.get('id') || '';
    this.heroStats = this.battleService.getHeroStatsByPlayerId(this.id);

    const battleSub = this.battleService.listen<any>('battleStarted').subscribe(event => {
      this.battleService.setCurrentBattle(event);
      this.battleService.joinBattle(this.roomId, this.id);
      this.router.navigate([`/battle/${this.roomId}`]);
    });

    this.subs.push(battleSub);
  }

  /**
   * Notifica al servidor que el jugador está listo para iniciar la batalla.
   */
  onReady(): void {
    this.battleService.onReady(this.roomId, this.id, this.heroStats, this.team);
  }

  /**
   * Hook de destrucción del componente.
   * Libera todas las suscripciones a observables para evitar fugas de memoria.
   */
  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
