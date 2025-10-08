import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink,Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { HeroesService } from '../services/heroes.service';
import { MissionsService } from '../services/missions.service';
import type { MissionDetail } from '../domain/mission.models';
import { roleLabel } from '../domain/mission.models';
import Hero from '../domain/heroe.model';

@Component({
  standalone: true,
  selector: 'app-mission-detail',
  imports: [CommonModule, RouterLink, FormsModule],
  styleUrls: ['./app-misiones.component.css'],
  template: `
  <div class="mision-container">
    <section class="card" *ngIf="mission; else loading">
      <h3 class="mision-titulo">{{ mission.name }}</h3>

      <div><p class="mision-lore">{{ mission.lore }}</p></div>

      <div class="mision-info">
        <p><strong>Dificultad:</strong> <span class="dificultad">{{ mission.difficulty }}</span></p>
        <p><strong>Tipo:</strong> <span class="badge">{{ mission.type }}</span></p>
      </div>

      <hr>
      <div class="grid">
        <h3>Objetivo:</h3>
        <p *ngFor="let o of mission.objectives">{{ o.description }}</p>
        <div class="mision-lore">
          <h3>Requisitos</h3>
          <div class="small">Nivel mínimo: {{ mission.requirements.minLevel || mission.recommendedLevel[0] }}</div>
          <div class="small" *ngIf="mission.requirements.items?.length">Ítems: {{ mission.requirements.items?.join(', ') }}</div>
          <div class="small">Duración: ~{{ mission.durationSeconds }}s ({{ mission.totalTurns }} turnos)</div>
          <div class="small">Restricciones: {{ mission.restrictions.join('; ') }}</div>
        </div>
      </div>

      <hr>
      <div>
        <h3>Posible encuentro con Maestro</h3>
        <p class="mision-boss">Boss: <span>{{ mission.boss.name }}</span> ({{ roleLabel (mission.boss.role) }})</p>
        <div class="mision-master">Probabilidad: {{ (mission.masterInfo.probability*100) | number:'1.2-4' }}% · Aparece: {{ mission.masterInfo.appearsAt }}</div><br>
        <div class="mision-item">Épica si ganas: <span class="badge">{{ mission.masterInfo.epicIfWin }}</span></div>
      </div>

      <div>
        <br>
        <button class="mision-button" [routerLink]="['/missions', mission.id, 'enroll']">Inscribir héroe</button>
        <br>
        <br>
        <button class="mision-button" [routerLink]="['/misiones']">Volver a misiones</button>
      </div>
    </section>

    <ng-template #loading>
      <section class="card"><div class="small">Cargando detalle…</div></section>
    </ng-template>
  </div>
  `
})
export class MissionDetailPage implements OnInit {
  mission!: MissionDetail;


  selectedHeroId: string | null = null;
  constructor(private route: ActivatedRoute, private api: MissionsService) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.getMission(id).subscribe(m => this.mission = m);
  }


  roleLabel = roleLabel;
}
