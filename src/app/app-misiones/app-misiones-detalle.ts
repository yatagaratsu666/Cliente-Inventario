import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { HeroesService } from '../services/heroes.service';
import { MissionsService } from '../services/missions.service';
import type { MissionDetail } from '../domain/mission.models';
import { roleLabel } from '../domain/mission.models';
import Hero from '../domain/heroe.model';

/**
 * MissionDetailPage
 *
 * Componente Angular que muestra el detalle de una misión específica dentro del juego.
 *
 * Este componente se encarga de:
 * - Consultar y mostrar la información completa de una misión seleccionada.
 * - Renderizar los objetivos, requisitos y datos del jefe o maestro de la misión.
 * - Proporcionar opciones para inscribir héroes y regresar al listado de misiones.
 *
 * @property {MissionDetail} mission - Objeto que contiene todos los datos detallados de la misión actual.
 * @property {string | null} selectedHeroId - Identificador del héroe seleccionado para inscribirse.
 * @property {function} roleLabel - Función que devuelve la etiqueta correspondiente al rol de un personaje.
 */
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

  /** Objeto que contiene los datos detallados de la misión actual */
  mission!: MissionDetail;

  /** Identificador del héroe seleccionado para inscribirse */
  selectedHeroId: string | null = null;

  /** Función que obtiene la etiqueta del rol del personaje */
  roleLabel = roleLabel;

  /**
   * Constructor del componente.
   *
   * Inyecta los servicios necesarios para la obtención de datos y la gestión de rutas.
   *
   * @param {ActivatedRoute} route - Servicio que proporciona acceso a los parámetros de la ruta activa.
   * @param {MissionsService} api - Servicio encargado de obtener los datos de las misiones desde el backend.
   */
  constructor(private route: ActivatedRoute, private api: MissionsService) { }

  /**
   * Inicializa el componente y carga los datos de la misión correspondiente al ID recibido en la ruta.
   *
   * @returns {void}
   */
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.getMission(id).subscribe(m => this.mission = m);
  }
}
