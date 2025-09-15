import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BattleService } from '../services/battle.service';
import { FormsModule } from '@angular/forms';
import { AppChatComponent } from "../app-chat/app-chat.component";
import { Observable } from 'rxjs';
/**
 * Componente Angular encargado de manejar la lógica de las batallas en curso.
 * 
 * Combina la funcionalidad del servidor autoritativo con mejoras de UI:
 * - Temporizadores de turno y batalla
 * - Sistema de logs de batalla
 * - Selección visual de objetivos
 * - Gestión mejorada de habilidades y cooldowns
 */
@Component({
  selector: 'app-battle',
  standalone: true,
  templateUrl: './battle.component.html',
  styleUrls: ['./battle.component.css'],
  imports: [CommonModule, FormsModule, AppChatComponent]
})
export class BattleComponent implements OnInit, OnDestroy {
  // ===== PROPIEDADES DEL SERVIDOR AUTORITATIVO =====
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

  /** ID del jugador actual */
  myPlayerId = localStorage.getItem('username') || '';

  /** Indica si se debe mostrar el resultado de la batalla */
  showResult: boolean = false;

  /** Indica si el jugador actual fue el ganador */
  isWinner: boolean = false;

  /** Equipo al que pertenece el jugador actual */
  myTeam: string = 'A';

  // ===== PROPIEDADES MEJORADAS =====
  /** Temporizador del turno actual */
  turnTimer: string = '60';

  /** Temporizador total de la batalla */
  battleTimer: string = '8:00';

  /** Logs de la batalla */
  battleLogs: any[] = [];

  /** Intervalo para el temporizador de turno */
  private turnTimerInterval: any;

  /** Intervalo para el temporizador de batalla */
  private battleTimerInterval: any;

  /** Tiempo restante del turno en segundos */
  private turnTimeLeft: number = 60;

  /** Tiempo restante de la batalla en segundos */
  private battleTimeLeft: number = 480; // 8 minutos

  /** ID de la sala de batalla */
  roomId: string = '';

  /** Habilidades con estado de cooldown */
  mySkillsWithCooldown: any[] = [];


  /**
   * Constructor del componente.
   */
  constructor(private battleService: BattleService, private router: Router, private route: ActivatedRoute) {}

  /**
   * Hook de inicialización.
   */
  ngOnInit(): void {
    this.roomId = this.route.snapshot.paramMap.get('id') || '';
    this.initializeBattle();
    this.initializeTimers();
    this.setupBattleListeners();
    this.addSystemLog('La batalla ha comenzado');
    this.getImageById(this.myPlayerId)
  }

  /**
   * Hook de destrucción.
   */
  ngOnDestroy(): void {
    this.clearTimers();
  }

  // ===== INICIALIZACIÓN =====
  
  /**
   * Inicializa el estado de la batalla desde el servidor.
   */
  private initializeBattle(): void {
    this.battle = this.battleService.getCurrentBattle();
    this.turnQueue = this.battle ? this.battle.turns : [];
    this.currentTurn = this.turnQueue[this.battle.battle.currentTurnIndex] || null;

    this.teamA = this.battle ? this.battle.battle.teams[0].players : [];
    this.initialTeamALife = new Map(this.teamA.map(p => [p.username, p.heroStats.hero.health]));
    
    this.teamB = this.battle ? this.battle.battle.teams[1].players : [];
    this.initialTeamBLife = new Map(this.teamB.map(p => [p.username, p.heroStats.hero.health]));

    this.myTeam = this.teamA.some(p => p.username === this.myPlayerId) ? 'A' : 'B';
    this.battle = this.battle.battle;

    this.initializeMySkills();
  }

  /**
   * Inicializa las habilidades del jugador con cooldowns locales.
   */
  private initializeMySkills(): void {
    const skills = this.getMySkills();
    this.mySkillsWithCooldown = skills.map(skill => ({
      ...skill,
      currentCooldown: 0,
      isOnCooldown: false
    }));
  }

  /**
   * Configura los listeners para eventos del servidor.
   */
  private setupBattleListeners(): void {
    this.battleService.listen<any>('actionResolved').subscribe(event => {
      this.handleActionResolved(event);
    });

    this.battleService.listen<any>('battleEnded').subscribe(event => {
      this.handleBattleEnded(event);
    });

    this.battleService.listen<any>('error').subscribe(event => {
      this.handleError(event);
    });
  }

  // ===== MANEJADORES DE EVENTOS DEL SERVIDOR =====

  /**
   * Maneja la resolución de acciones desde el servidor.
   */
  private handleActionResolved(event: any): void {
    this.battle = event.battle;
    this.teamA = this.battle.teams[0].players;
    this.teamB = this.battle.teams[1].players;
    this.currentTurn = event.nextTurnPlayer;

    // Agregar log de la acción
    const lastLog = event.battle.battleLogger.logs.slice(-1)[0];
    if (lastLog && !this.battleLogs.find(log => log.id === lastLog.timestamp)) {
      this.addActionLog(lastLog);
    }

    // Reiniciar temporizador de turno
    this.resetTurnTimer();

    // Actualizar cooldowns locales
    this.updateLocalCooldowns();
  }

  /**
   * Maneja el final de la batalla.
   */
  private handleBattleEnded(event: any): void {
    this.clearTimers();
    this.isWinner = event.winner === this.myTeam;
    this.showResult = true;
    
    this.addSystemLog(this.isWinner ? '¡Victoria!' : 'Derrota');
    
    setTimeout(() => {
      this.router.navigate(['/battles']);
    }, 3000);
  }

  /**
   * Maneja errores del servidor.
   */
  private handleError(event: any): void {
    this.addSystemLog(`Error: ${event.error}`);
    console.error('Battle error:', event.error);
  }

  // ===== TEMPORIZADORES =====

  /**
   * Inicializa los temporizadores de turno y batalla.
   */
  private initializeTimers(): void {
    this.startTurnTimer();
    this.startBattleTimer();
  }

  /**
   * Inicia el temporizador del turno.
   */
  private startTurnTimer(): void {
    this.turnTimeLeft = 60;
    this.turnTimerInterval = setInterval(() => {
      this.turnTimeLeft--;
      this.turnTimer = this.turnTimeLeft.toString();
      
      if (this.turnTimeLeft <= 0) {
        this.onTurnTimeout();
      }
    }, 1000);
  }

  /**
   * Inicia el temporizador de la batalla.
   */
  private startBattleTimer(): void {
    this.battleTimerInterval = setInterval(() => {
      this.battleTimeLeft--;
      const minutes = Math.floor(this.battleTimeLeft / 60);
      const seconds = this.battleTimeLeft % 60;
      this.battleTimer = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      if (this.battleTimeLeft <= 0) {
        this.onBattleTimeout();
      }
    }, 1000);
  }

  /**
   * Limpia todos los temporizadores.
   */
  private clearTimers(): void {
    if (this.turnTimerInterval) {
      clearInterval(this.turnTimerInterval);
    }
    if (this.battleTimerInterval) {
      clearInterval(this.battleTimerInterval);
    }
  }

  /**
   * Reinicia el temporizador del turno.
   */
  private resetTurnTimer(): void {
    if (this.turnTimerInterval) {
      clearInterval(this.turnTimerInterval);
    }
    this.startTurnTimer();
  }

  /**
   * Maneja el timeout del turno.
   */
  private onTurnTimeout(): void {
    if (this.isMyTurn()) {
      this.addSystemLog(`${this.myPlayerId} perdió su turno por tiempo`);
      // En el servidor autoritativo, el servidor maneja los timeouts
    }
  }

  /**
   * Maneja el timeout de la batalla.
   */
  private onBattleTimeout(): void {
    this.addSystemLog('¡Se acabó el tiempo de batalla!');
    // El servidor maneja el final por tiempo
  }

  // ===== HABILIDADES Y ACCIONES =====

  /**
   * Obtiene las habilidades del jugador actual.
   */
getMySkills(): any[] {
  const me = [...this.teamA, ...this.teamB].find(p => p.username === this.myPlayerId);
  if (!me) return [];

  const basic = [{ name: 'Basic Attack', type: 'BASIC_ATTACK' }];

  const specials = (me.heroStats.hero?.specialActions || []).map((s: any) => ({
    name: s.name,
    type: 'SPECIAL_SKILL',
    ...s
  }));

  const masters = (me.heroStats.equipped?.epicAbilities || []).map((m: any) => ({
    name: m.name,
    type: 'MASTER_SKILL',
    ...m
  }));

  return [...basic, ...specials, ...masters];
}


  /**
   * Obtiene las habilidades especiales con cooldown.
   */
  getMySpecialSkills(): any[] {
    return this.mySkillsWithCooldown.filter(skill => skill.type === 'SPECIAL_SKILL');
  }

  /**
   * Obtiene las habilidades maestras con cooldown.
   */
  getMyMasterSkills(): any[] {
    return this.mySkillsWithCooldown.filter(skill => skill.type === 'MASTER_SKILL');
  }

  /**
   * Verifica si una habilidad está en cooldown.
   */
  canUseSkill(skill: any): boolean {
    const skillWithCooldown = this.mySkillsWithCooldown.find(s => s.name === skill.name);
    return !skillWithCooldown?.isOnCooldown;
  }

  /**
   * Verifica si el jugador tiene una habilidad maestra disponible.
   */
  canUseEpicSkill(): boolean {
    return this.getMyMasterSkills().some(skill => !skill.isOnCooldown);
  }

  /**
   * Verifica si el jugador tiene habilidades especiales disponibles.
   */
  canUseSpecialSkill(): boolean {
    return this.getMySpecialSkills().some(skill => !skill.isOnCooldown);
  }

  /**
   * Obtiene el nombre de la habilidad maestra.
   */
  getEpicSkillName(): string {
    const epicSkill = this.getMyMasterSkills().find(skill => !skill.isOnCooldown);
    return epicSkill ? epicSkill.name : 'Ninguna';
  }

  /**
   * Obtiene el cooldown restante de la habilidad maestra.
   * Si no hay habilidad disponible, retorna 0.
   *  */
  getEpicSkillCooldown(): number {
    const epicSkill = this.getMyMasterSkills().find(skill => !skill.isOnCooldown);
    return epicSkill ? epicSkill.cooldown : 0;
  }

  /**
   * Actualiza los cooldowns locales.
   */
  private updateLocalCooldowns(): void {
    if (!this.isMyTurn()) return;
    this.mySkillsWithCooldown.forEach(skill => {
      if (skill.currentCooldown > 0) {
        skill.currentCooldown--;
        skill.isOnCooldown = skill.currentCooldown > 0;
      }
    });
  }

  /**
   * Aplica cooldown a una habilidad.
   */
  private applyCooldownToSkill(skillName: string, cooldownTurns: number = 3): void {
    const skill = this.mySkillsWithCooldown.find(s => s.name === skillName);
    if (skill) {
      skill.currentCooldown = cooldownTurns;
      skill.isOnCooldown = true;
    }
  }

  // ===== SELECCIÓN Y OBJETIVOS =====

  /**
   * Selecciona un objetivo para la acción.
   */
  selectTarget(username: string): void {
    if (!this.isMyTurn()) return;
    
    if (this.isEnemyPlayer(username)) {
      this.selectedTarget = username;
      this.addSystemLog(`Objetivo seleccionado: ${username}`);
    }
  }

  /**
   * Limpia la selección de objetivo.
   */
  clearTarget(): void {
    this.selectedTarget = null;
  }

  /**
   * Verifica si un jugador es enemigo.
   */
  isEnemyPlayer(username: string): boolean {
    const myTeamPlayers = this.getMyTeamPlayers();
    return !myTeamPlayers.some(player => player.username === username);
  }

  /**
   * Obtiene los jugadores de mi equipo.
   */
  getMyTeamPlayers(): any[] {
    return this.teamA.some(p => p.username === this.myPlayerId) ? this.teamA : this.teamB;
  }

  /**
   * Obtiene el equipo enemigo.
   */
  getEnemyTeam(): any[] {
    return this.teamA.some(p => p.username === this.myPlayerId) ? this.teamB : this.teamA;
  }

  // ===== ACCIONES DE COMBATE (SERVIDOR AUTORITATIVO) =====

  /**
   * Ejecuta un ataque básico.
   */
  basicAttack(targetId: string): void {
    this.battleService.sendBasic(targetId, this.battle.id, this.myPlayerId);
  }

  /**
   * Usa una habilidad especial.
   */
  useSpecial(targetId: string, skillName: string): void {
    this.battleService.sendSpecial(skillName, targetId, this.battle.id, this.myPlayerId);
    this.applyCooldownToSkill(skillName, 2); // Cooldown local temporal
  }

  /**
   * Usa una habilidad maestra.
   */
  useMaster(targetId: string, abilityName: string): void {
    this.battleService.sendMaster(abilityName, targetId, this.battle.id, this.myPlayerId);
    this.applyCooldownToSkill(abilityName, 3); // Cooldown local temporal
  }

  /**
   * Ejecuta la acción seleccionada.
   */
  performAction(skill: any): void {
    this.selectedSkill = skill;
    if (!this.selectedTarget) {
      this.addSystemLog('Debes seleccionar un objetivo');
      return;
    }

    if (!this.selectedSkill) {
      this.addSystemLog('Debes seleccionar una habilidad');
      return;
    }

    if (!this.canUseSkill(this.selectedSkill)) {
      this.addSystemLog(`${this.selectedSkill.name} está en cooldown`);
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

  // ===== SISTEMA DE LOGS =====

  /**
   * Agrega un log de acción.
   */
  private addActionLog(actionResult: any): void {
    let message = `${actionResult.attacker} atacó a ${actionResult.target}`;
    if (actionResult.value) {
      message += ` causando ${actionResult.value} de daño`;
    }

    console.log(actionResult.value)
    
    this.battleLogs.push({
      id: actionResult.timestamp,
      type: 'action',
      message,
      timestamp: actionResult.timestamp
    });
    this.scrollToLatestLog();
  }

  /**
   * Agrega un log del sistema.
   */
  addSystemLog(message: string): void {
    this.battleLogs.push({
      id: Date.now(),
      type: 'system',
      message,
      timestamp: new Date()
    });
    this.scrollToLatestLog();
  }

  /**
   * Limpia todos los logs.
   */
  clearLogs(): void {
    this.battleLogs = [];
  }

  /**
   * Hace scroll al último log.
   */
  private scrollToLatestLog(): void {
    setTimeout(() => {
      const logsContainer = document.querySelector('.logs-container');
      if (logsContainer) {
        logsContainer.scrollTop = logsContainer.scrollHeight;
      }
    }, 100);
  }

  /**
   * Función de tracking para ngFor de logs.
   */
  trackLogById(index: number, log: any): any {
    return log.id;
  }

  // ===== MÉTODOS DE UTILIDAD =====

  /**
   * Maneja la selección de habilidad.
   */
  onSkillSelected(event: any): void {
    console.log('Skill seleccionada:', this.selectedSkill);
  }

  /**
   * Compara dos habilidades.
   */
  compareSkills = (s1: any, s2: any): boolean => {
    return s1 && s2 ? s1.name === s2.name : s1 === s2;
  };

  /**
   * Obtiene la imagen de un jugador.
   */
getImageById(playerId: string): Observable<string> {
  return this.battleService.getImageById(playerId)
}


  /**
   * Verifica si es el turno del jugador actual.
   */
  isMyTurn(): boolean {
    return this.currentTurn === this.myPlayerId;
  }

  /**
   * Obtiene el nombre del jugador actual en turno.
   */
  getCurrentPlayerName(): string {
    return this.currentTurn || 'Desconocido';
  }

  /**
   * Obtiene el color de la barra de vida.
   */
  getHealthColor(health: number, username: string): string {
    const maxHealth = this.initialTeamALife.get(username) || this.initialTeamBLife.get(username) || 100;
    const percent = (health / maxHealth) * 100;
    
    if (percent > 60) return '#4caf50'; // Verde
    if (percent > 30) return '#ff9800'; // Naranja
    return '#f44336'; // Rojo
  }

  /**
   * Obtiene el porcentaje de vida.
   */
  getHealthPercentage(player: any): number {
    const maxHealth = this.initialTeamALife.get(player.username) || 
                      this.initialTeamBLife.get(player.username) || 
                      player.heroStats.hero.health;
    return (player.heroStats.hero.health / maxHealth) * 100;
  }

  /**
   * Obtiene el icono de una habilidad.
   */
  getSkillIcon(skill: any): string {
    const iconMap: { [key: string]: string } = {
      'Basic Attack': '⚔️',
      'BASIC_ATTACK': '⚔️',
      'SPECIAL_SKILL': '✨',
      'MASTER_SKILL': '🔥',
      'default': '🗡️'
    };
    
    return iconMap[skill.type] || iconMap[skill.name] || iconMap['default'];
  }

  /**
   * Navega de regreso al lobby.
   */
  returnToLobby(): void {
    this.router.navigate(['/battles']);
  }

  // ===== MÉTODOS PLACEHOLDER =====
  
  /**
   * Placeholder para iniciar batalla.
   */
  startBattle(): void {
    console.log('Battle started');
  }
}