import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BattleService } from '../services/battle.service';
import { FormsModule } from '@angular/forms';

/**
 * Componente Angular encargado de manejar la lógica de las batallas en curso.
 *
 * Funcionalidades principales:
 * - Gestiona el estado actual de la batalla (`battle`).
 * - Controla los turnos y acciones de los jugadores (`turnQueue`, `currentTurn`).
 * - Renderiza equipos y sus estadísticas de vida inicial y actual.
 * - Permite seleccionar y ejecutar acciones: ataques básicos, habilidades especiales y habilidades maestras.
 * - Escucha eventos provenientes del servidor: `actionResolved`, `battleEnded`, `error`.
 * - Determina si es el turno del jugador actual y si ganó la batalla.
 * - Controla la visualización del resultado final de la batalla.
 */
@Component({
  selector: 'app-battle',
  standalone: true,
  templateUrl: './battle.component.html',
  styleUrls: ['./battle.component.css'],
  imports: [CommonModule, FormsModule]
})
export class BattleComponent implements OnInit {
  /** Habilidad seleccionada actualmente */
  selectedSkill: any;

  /** ID del objetivo seleccionado */
  selectedTarget: string | null = null;

  /** Estado actual de la batalla */
  battle: any = null;

  /** Cola de turnos de jugadores */
  turnQueue: string[] = [];

  /** Jugador cuyo turno está en curso */
  currentTurn: string | null = null;

  /** Jugadores del equipo A */
  teamA: any[] = [];

  /** Vida inicial de los jugadores del equipo A */
  initialTeamALife: Map<string, number> = new Map();

  /** Jugadores del equipo B */
  teamB: any[] = [];

  /** Vida inicial de los jugadores del equipo B */
  initialTeamBLife: Map<string, number> = new Map();

  /** ID del jugador actual (obtenido desde localStorage) */
  myPlayerId = localStorage.getItem('username') || '';

  /** Indica si se debe mostrar el resultado de la batalla */
  showResult: boolean = false;

  /** Indica si el jugador actual fue el ganador */
  isWinner: boolean = false;

  /** Equipo al que pertenece el jugador actual */
  myTeam: string = 'A';

  /**
   * Constructor del componente.
   *
   * @param battleService - Servicio que gestiona la lógica de batallas.
   * @param router - Servicio de enrutamiento Angular.
   */
  constructor(private battleService: BattleService, private router: Router) {}

  /**
   * Hook de inicialización.
   * - Recupera la batalla actual desde el servicio.
   * - Configura equipos, turnos y vidas iniciales.
   * - Se suscribe a eventos de batalla (`actionResolved`, `battleEnded`, `error`).
   */
  ngOnInit(): void {
    this.battle = this.battleService.getCurrentBattle();
    this.turnQueue = this.battle ? this.battle.turns : [];
    this.currentTurn = this.turnQueue[this.battle.battle.currentTurnIndex] || null;

    this.teamA = this.battle ? this.battle.battle.teams[0].players : [];
    this.initialTeamALife = new Map(this.teamA.map(p => [p.username, p.heroStats.hero.health]));
    this.teamB = this.battle ? this.battle.battle.teams[1].players : [];
    this.initialTeamBLife = new Map(this.teamB.map(p => [p.username, p.heroStats.hero.health]));

    this.myTeam = this.teamA.some(p => p.username === this.myPlayerId) ? 'A' : 'B';
    this.battle = this.battle.battle;

    this.battleService.listen<any>('actionResolved').subscribe(event => {
      this.battle = event.battle;
      this.teamA = this.battle.teams[0].players;
      this.teamB = this.battle.teams[1].players;
      this.currentTurn = event.nextTurnPlayer;
    });

    this.battleService.listen<any>('battleEnded').subscribe(event => {
      this.isWinner = event.winner === this.myTeam;
      this.showResult = true;
      this.initialTeamALife = new Map();
      this.initialTeamBLife = new Map();

      setTimeout(() => {
        this.router.navigate(['/battles']);
      }, 3000);
    });

    this.battleService.listen<any>('error').subscribe(event => {
      alert('Ha ocurrido un error en la batalla: ' + event.error);
    });
  }

  /** Placeholder para iniciar la batalla (por implementar) */
  startBattle(): void {}

  /**
   * Compara dos habilidades para verificar si son iguales.
   * @param s1 - Primera habilidad.
   * @param s2 - Segunda habilidad.
   * @returns `true` si son iguales, de lo contrario `false`.
   */
  compareSkills = (s1: any, s2: any): boolean => {
    return s1 && s2 ? s1.name === s2.name : s1 === s2;
  };

  /**
   * Obtiene las habilidades del jugador actual.
   * Incluye ataque básico, habilidades especiales y habilidades maestras.
   * @returns Arreglo de habilidades disponibles para el jugador.
   */
  getMySkills(): any[] {
    const me = [...this.teamA, ...this.teamB].find(p => p.username === this.myPlayerId);
    if (!me) return [];

    const basic = [{ name: 'Basic Attack', type: 'BASIC_ATTACK' }];
    const specials = me.heroStats.hero.specialActions.map((s: any) => ({
      name: s.name,
      type: 'SPECIAL_SKILL',
      ...s
    }));
    const masters = me.heroStats.equipped.epicAbilites.map((m: any) => ({
      name: m.name,
      type: 'MASTER_SKILL',
      ...m
    }));

    return [...basic, ...specials, ...masters];
  }

  /**
   * Maneja la selección de una habilidad.
   * @param event - Evento de selección de habilidad.
   */
  onSkillSelected(event: any): void {
    console.log('Skill seleccionada:', this.selectedSkill);
  }

  /**
   * Devuelve la imagen asociada a un jugador por su ID.
   * @param playerId - ID del jugador.
   * @returns URL de la imagen correspondiente.
   */
  getImageById(playerId: string): string {
    return this.battleService.getImageById(playerId);
  }

  /**
   * Obtiene el equipo enemigo al que se enfrenta el jugador actual.
   * @returns Lista de jugadores del equipo enemigo.
   */
  getEnemyTeam(): any[] {
    return this.teamA.some(p => p.username === this.myPlayerId) ? this.teamB : this.teamA;
  }

  /**
   * Verifica si es el turno del jugador actual.
   * @returns `true` si es su turno, de lo contrario `false`.
   */
  isMyTurn(): boolean {
    return this.currentTurn === this.myPlayerId;
  }

  /**
   * Ejecuta un ataque básico contra un objetivo.
   * @param targetId - ID del jugador objetivo.
   */
  basicAttack(targetId: string): void {
    this.battleService.sendBasic(targetId, this.battle.id, this.myPlayerId);
  }

  /**
   * Usa una habilidad especial contra un objetivo.
   * @param targetId - ID del jugador objetivo.
   * @param skillName - Nombre de la habilidad especial.
   */
  useSpecial(targetId: string, skillName: string): void {
    this.battleService.sendSpecial(skillName, targetId, this.battle.id, this.myPlayerId);
  }

  /**
   * Usa una habilidad maestra contra un objetivo.
   * @param targetId - ID del jugador objetivo.
   * @param abilityName - Nombre de la habilidad maestra.
   */
  useMaster(targetId: string, abilityName: string): void {
    this.battleService.sendMaster(abilityName, targetId, this.battle.id, this.myPlayerId);
  }

  /**
   * Ejecuta la acción seleccionada (ataque básico, especial o maestro).
   * - Valida que haya un objetivo seleccionado.
   * - Llama al método correspondiente según el tipo de habilidad seleccionada.
   */
  performAction(): void {
    if (!this.selectedTarget) {
      alert('Debes seleccionar un objetivo');
      return;
    }

    switch (this.selectedSkill.type) {
      case 'BASIC_ATTACK':
        this.basicAttack(this.selectedTarget);
        break;
      case 'SPECIAL_SKILL':
        this.useSpecial(this.selectedTarget, this.selectedSkill.name);
        break;
      case 'MASTER_SKILL':
        this.useMaster(this.selectedTarget, this.selectedSkill.name);
        break;
    }

    this.selectedTarget = null;
  }

  /**
   * Determina el color de la barra de vida en función de la salud restante.
   * @param health - Vida actual del jugador.
   * @param username - Nombre del jugador (para obtener vida máxima inicial).
   * @returns Color (`green`, `yellow`, `red`) según el porcentaje de salud.
   */
  getHealthColor(health: number, username: string): string {
    const maxHealth = this.initialTeamALife.get(username) || this.initialTeamBLife.get(username) || 100;
    const percent = (health / maxHealth) * 100;
    if (percent > 60) return 'green';
    if (percent > 40) return 'yellow';
    if (percent <= 40) return 'red';
    return 'red';
  }
}
