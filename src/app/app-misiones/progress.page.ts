import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { MissionsService } from '../services/missions.service';
import type { ProgressResponse } from '../domain/mission.models';

/**
 * ProgressPage
 *
 * Página que muestra el progreso en tiempo real de una misión en ejecución.
 * Se conecta al backend mediante Server-Sent Events (SSE) para recibir actualizaciones
 * del estado de la misión, incluyendo cambios de turno y finalización.
 *
 * Responsabilidades principales:
 * - Obtener el identificador de ejecución de la misión desde la ruta activa.
 * - Consultar el progreso actual de la misión.
 * - Escuchar eventos del servidor para reflejar cambios en tiempo real.
 * - Redirigir automáticamente al usuario al resultado de la misión cuando esta finaliza.
 *
 * @property {string} execId - Identificador único de la ejecución de la misión.
 * @property {ProgressResponse} data - Información del progreso de la misión.
 * @property {any[]} events - Lista de eventos recibidos recientemente.
 * @property {EventSource | undefined} es - Conexión SSE para escuchar actualizaciones del servidor.
 */

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

  /** Identificador único de la ejecución de la misión */
  execId = '';

  /** Datos de progreso de la misión obtenidos del backend */
  data!: ProgressResponse;

  /** Lista de eventos recientes (máximo 50) */
  events: any[] = [];

  /** Fuente de eventos del servidor (SSE) */
  es?: EventSource;

  /**
   * Constructor del componente.
   * Inyecta los servicios necesarios para manejar la ruta, la comunicación con el backend
   * y la navegación dentro de la aplicación.
   *
   * @param {ActivatedRoute} route - Permite acceder a los parámetros de la ruta actual.
   * @param {MissionsService} api - Servicio para interactuar con la API de misiones.
   * @param {Router} router - Servicio de enrutamiento para la navegación.
   */
  constructor(
    private route: ActivatedRoute,
    private api: MissionsService,
    private router: Router
  ) { }

  /**
   * Inicializa el componente y configura la conexión SSE para escuchar
   * actualizaciones de la misión en ejecución.
   *
   * @returns {void}
   */
  ngOnInit(): void {
    // Obtiene el ID de la ejecución desde los parámetros de la ruta
    this.execId = this.route.snapshot.paramMap.get('execId')!;

    // Carga inicial del estado de progreso
    this.api.progress(this.execId).subscribe(d => this.data = d);

    // Conecta al servidor mediante SSE para escuchar eventos
    this.es = this.api.sse(this.execId);
    if (this.es) {

      // Evento: actualización de progreso
      this.es.addEventListener('progressUpdated', (e: MessageEvent) => {
        this.api.progress(this.execId).subscribe(d => this.data = d);
        this.events.unshift({ type: 'progressUpdated', ts: new Date().toISOString() });
        this.events = this.events.slice(0, 50);
      });

      // Evento: avance de turno
      this.es.addEventListener('turnAdvanced', (e: MessageEvent) => {
        this.events.unshift({ type: 'turnAdvanced', ts: new Date().toISOString() });
        this.events = this.events.slice(0, 50);
      });

      // Evento: misión finalizada
      this.es.addEventListener('missionEnded', (e: MessageEvent) => {
        if (this.es) this.es.close();
        // Redirige al resultado de la misión al finalizar
        this.router.navigate(['/missions', 'result', this.execId]);
      });
    }
  }

  /**
   * Cierra la conexión SSE al destruir el componente para evitar fugas de memoria.
   *
   * @returns {void}
   */
  ngOnDestroy(): void {
    if (this.es) this.es.close();
  }
}
