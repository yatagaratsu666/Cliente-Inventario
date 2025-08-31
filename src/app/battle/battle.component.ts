// battle.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { io, Socket } from 'socket.io-client';
import { BattleService } from '../services/battle.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-battle',
  standalone: true,
  templateUrl: './battle.component.html',
  styleUrls: ['./battle.component.css'],
  imports: [CommonModule, FormsModule]
})
export class BattleComponent implements OnInit {
  selectedSkill: any;
  selectedTarget: string | null = null;
  battle: any = null;
  turnQueue: string[] = [];
  currentTurn: string | null = null;
  teamA: any[] = [];
  initialTeamALife: Map<string, number> = new Map();
  teamB: any[] = [];
  initialTeamBLife: Map<string, number> = new Map();
  myPlayerId = localStorage.getItem('username') || ''; // <- luego esto lo puedes recibir dinámicamente
  showResult: boolean = false;
  isWinner: boolean = false;
  myTeam: string = 'A'; // o lo que corresponda dinámicamente


  constructor(private battleService: BattleService, private router: Router) {}

  ngOnInit(): void {
    this.battle = this.battleService.getCurrentBattle();
    console.log(this.battle);

    this.turnQueue = this.battle ? this.battle.turns : [];
    this.currentTurn = this.turnQueue[this.battle.battle.currentTurnIndex] || null;
    console.log('Current Turn:', this.currentTurn);

    this.teamA = this.battle ? this.battle.battle.teams[0].players : [];
    this.initialTeamALife = new Map(this.teamA.map(p => [p.username, p.heroStats.hero.health]));
    this.teamB = this.battle ? this.battle.battle.teams[1].players : [];
    this.initialTeamBLife = new Map(this.teamB.map(p => [p.username, p.heroStats.hero.health]));

    this.myTeam = this.teamA.some(p => p.username === this.myPlayerId) ? 'A' : 'B';

    this.battle = this.battle.battle;

    const battleSub = this.battleService.listen<any>("actionResolved").subscribe(event => {
      console.log('Action Resolved Event:', event);

      // Actualizar el objeto battle completo que viene del server
      this.battle = event.battle;
      console.log('Battle actualizado:', this.battle);
      // Actualizar equipos
      this.teamA = this.battle.teams[0].players;
      this.teamB = this.battle.teams[1].players;

      // Actualizar turno
      this.currentTurn = event.nextTurnPlayer;

      // Opcional: mostrar log de la acción
      if (event.action) {
        console.log(`${event.action.sourcePlayerId} usó ${event.action.type} sobre ${event.action.targetPlayerId}`);
      }
    });

    const winSub = this.battleService.listen<any>("battleEnded").subscribe(event => {
      console.log('Battle Ended Event:', event);
        this.isWinner = event.winner === this.myTeam;
        this.showResult = true;

        // Redirigir después de 3 segundos
        setTimeout(() => {
          this.router.navigate(['/battles']);
        }, 3000);
    });

    const errorSub = this.battleService.listen<any>("error").subscribe(event => {
      console.log('Battle Error Event:', event);
      alert('Ha ocurrido un error en la batalla: ' + event.error);
    });
  }

  startBattle() {

  }

  compareSkills = (s1: any, s2: any) => {
    return s1 && s2 ? s1.name === s2.name : s1 === s2;
  };

  getMySkills() {
    const me = [...this.teamA, ...this.teamB].find(p => p.username === this.myPlayerId);
    if (!me) return [];

    const basic = [{
      name: "Basic Attack",
      type: "BASIC_ATTACK"
    }];

    const specials = me.heroStats.hero.specialActions.map((s: any) => ({
      name: s.name,
      type: "SPECIAL_SKILL",
      ...s
    }));

    const masters = me.heroStats.equipped.epicAbilites.map((m: any) => ({
      name: m.name,
      type: "MASTER_SKILL",
      ...m
    }));

    return [...basic, ...specials, ...masters];
  }

  onSkillSelected(event: any) {
    console.log("Skill seleccionada:", this.selectedSkill);
  }

  getEnemyTeam(): any[] {
    return this.teamA.some(p => p.username === this.myPlayerId) ? this.teamB : this.teamA;
  }


  // Saber si es mi turno
  isMyTurn(): boolean {
    return this.currentTurn === this.myPlayerId;
  }

  // Acciones posibles
  basicAttack(targetId: string) {
    this.battleService.sendBasic(targetId, this.battle.id, this.myPlayerId);
  }

  useSpecial(targetId: string, skillName: string) {
    this.battleService.sendSpecial(skillName, targetId, this.battle.id, this.myPlayerId);
  }

  useMaster(targetId: string, abilityName: string) {
    this.battleService.sendMaster(abilityName, targetId, this.battle.id, this.myPlayerId);
  }

  performAction() {
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
  // limpiar después de atacar
  this.selectedTarget = null;
}


  // Cambiar color de barra de vida
  getHealthColor(health: number, username: string): string {
    const maxHealth = this.initialTeamALife.get(username) || 100;
    const percent = (health / maxHealth) * 100;
    if (percent > 60) return 'green';
    if (percent > 40) return 'yellow';
    if (percent <= 40) return 'red';
    return 'red';
  }
}
