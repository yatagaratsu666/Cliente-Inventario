import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { MissionsService } from '../services/missions.service';
import type { ProgressResponse } from '../domain/mission.models';

@Component({
  standalone: true,
  selector: 'app-progress',
  imports: [CommonModule, RouterLink],
  styleUrls: ['./app-misiones.component.css'],
  template: `
  <div class="mision-container">
    <section class="card" *ngIf="data; else loading">
      <h2 class="mision-titulo" style="margin:0 0 12px 0;">Progreso de misión</h2>

      <div class="progress"><div class="bar" [style.width.%]="data.progress.percent"></div></div>
      <div class="small" style="margin-top:6px;">
        {{ data.progress.percent }}% · Turno {{ data.progress.turn }}/{{ data.progress.totalTurns }}
        · Tiempo {{ data.progress.timeElapsed }}s / {{ data.progress.timeTotal }}s
      </div>

      <div class="grid" style="margin-top:16px;">
        <div class="card">
          <h3 style="margin:0 0 8px 0;">Objetivos</h3>
          <table class="table">
            <tr><th>Descripción</th><th>k/n</th></tr>
            <tr *ngFor="let o of data.progress.objectives">
              <td>{{ o.description }}</td>
              <td>{{ o.currentCount }}/{{ o.targetCount }}</td>
            </tr>
          </table>
        </div>
        <div class="card">
          <h3 style="margin:0 0 8px 0;">Eventos</h3>
          <ul class="small" style="max-height:200px; overflow:auto; margin:0; padding-left:16px;">
            <li *ngFor="let ev of events">{{ ev.type }} — {{ ev.ts || '' }}</li>
          </ul>
        </div>  
      </div>

      <div style="margin-top:16px;">
        <a class="mision-button" [routerLink]="['/missions']">Volver</a>
      </div>
    </section>
    <ng-template #loading>
      <section class="card"><div class="small">Cargando progreso…</div></section>
    </ng-template>
  </div>
  `
})

export class ProgressPage implements OnInit, OnDestroy {
  constructor(private route: ActivatedRoute, private api: MissionsService, private router: Router) {}
  
  execId = '';
  data!: ProgressResponse;
  events: any[] = [];
  es?: EventSource;

  ngOnInit() {
    this.execId = this.route.snapshot.paramMap.get('execId')!;
    this.api.progress(this.execId).subscribe(d => this.data = d);
    this.es = this.api.sse(this.execId);
    if (this.es) {
      this.es.addEventListener('progressUpdated', (e: MessageEvent) => {
        this.api.progress(this.execId).subscribe(d => this.data = d);
        this.events.unshift({ type: 'progressUpdated', ts: new Date().toISOString() });
        this.events = this.events.slice(0,50);
      });
      this.es.addEventListener('turnAdvanced', (e: MessageEvent) => {
        this.events.unshift({ type: 'turnAdvanced', ts: new Date().toISOString() });
        this.events = this.events.slice(0,50);
      });
      this.es.addEventListener('missionEnded', (e: MessageEvent) => {
        if (this.es) this.es.close();
        // redirige como el front de ejemplo, manteniendo rutas de este app
        this.router.navigate(['/missions', 'result', this.execId]);
      });
    }
  }

  ngOnDestroy(): void {
    if (this.es) this.es.close();
  }
}
