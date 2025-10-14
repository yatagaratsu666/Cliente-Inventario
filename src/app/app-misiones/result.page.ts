import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MissionsService } from '../services/missions.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';

/**
 * ResultPage
 *
 * Página encargada de mostrar el resultado final de una misión ejecutada.
 * Una vez obtenidos los datos desde el backend, se encarga de acreditar automáticamente
 * una cantidad fija de créditos al usuario que completó la misión.
 *
 * Responsabilidades principales:
 * - Obtener el ID de la ejecución de la misión desde la ruta activa.
 * - Consultar los resultados de la misión al backend.
 * - Acreditar automáticamente créditos al usuario tras recibir el resultado.
 *
 * @property {string} execId - Identificador único de la ejecución de la misión.
 * @property {any} data - Datos del resultado de la misión obtenidos del backend.
 * @property {boolean} creditedXp - Indica si ya se acreditó la experiencia (reservado para futuras mejoras).
 * @property {boolean} creditedCredits - Indica si ya se acreditaron los créditos para evitar duplicación.
 * @property {number} CREDITOS_A_AGREGAR - Cantidad de créditos a otorgar tras finalizar la misión.
 */

@Component({
  standalone: true,
  selector: 'app-result',
  imports: [CommonModule, RouterLink],
  styleUrls: ['./app-misiones.component.css'],
  template: `
  <div class="mision-container">
    <section class="card" *ngIf="data; else loading">
      <h2 class="mision-titulo" style="margin:0 0 12px 0;">Resultado de la misión</h2>

      <div *ngIf="data.result; else running">
        <div class="card">
          <h3 style="margin:0 0 8px 0;">Resumen</h3>
          <div class="small">Estado: {{ data.status }}</div>
          <div class="small">XP obtenida: <b>{{ data.result?.xpGained }}</b></div>
          <div class="small" *ngIf="data.result?.epicLearned">Épica aprendida: <span class="badge">{{ data.result?.epicLearned }}</span></div>
        </div>

        <div class="card" style="margin-top:12px;">
          <h3 style="margin:0 0 8px 0;">Drops</h3>
          <table class="table" *ngIf="data.result?.drops?.length; else nodrops">
            <tr><th>Tipo</th><th>Ítem</th><th>%</th></tr>
            <tr *ngFor="let d of data.result!.drops">
              <td>{{ d.type }}</td>
              <td>{{ d.name }}</td>
              <td>{{ d.chance }}%</td>
            </tr>
          </table>
          <ng-template #nodrops><div class="small">No cayeron ítems.</div></ng-template>
        </div>

        <div style="margin-top:16px;">
          <a class="mision-button" routerLink="/misiones">Volver a misiones</a>
        </div>
      </div>

      <ng-template #running>
        <div class="small">La misión sigue en curso…</div>
        <div style="margin-top:16px;">
          <a class="btn outline" [routerLink]="['/missions/progress', execId]">Ver progreso</a>
        </div>
      </ng-template>
    </section>
    <ng-template #loading>
      <section class="card"><div class="small">Cargando resultado…</div></section>
    </ng-template>
  </div>
  `
})


export class ResultPage implements OnInit {

  /** Identificador único de la ejecución de la misión */
  execId!: string;

  /** Resultado de la misión, obtenido desde el backend */
  data: any;

  /** Indica si ya se acreditó la experiencia (reservado para uso futuro) */
  private creditedXp = false;

  /** Indica si ya se acreditaron los créditos del usuario */
  private creditedCredits = false;

  /** Cantidad fija de créditos que se otorgan al completar la misión */
  private readonly CREDITOS_A_AGREGAR = 20;

  /**
   * Constructor del componente.
   * Inyecta los servicios necesarios para acceder a los parámetros de la ruta,
   * obtener resultados de misiones y realizar actualizaciones en el backend.
   *
   * @param {ActivatedRoute} route - Servicio para acceder a los parámetros de la ruta activa.
   * @param {MissionsService} api - Servicio para interactuar con la API de misiones.
   * @param {HttpClient} http - Cliente HTTP para enviar solicitudes al backend.
   */
  constructor(
    private route: ActivatedRoute,
    private api: MissionsService,
    private http: HttpClient
  ) { }

  /**
   * Inicializa la página, obtiene el resultado de la misión desde la API
   * y desencadena la acreditación automática de créditos al usuario.
   *
   * @returns {void}
   */
  ngOnInit(): void {
    this.execId = this.route.snapshot.paramMap.get('execId')!;
    this.api.result(this.execId).subscribe((r) => {
      this.data = r;
      this.creditarCreditos();
    });
  }

  /**
   * Acredita los créditos correspondientes al usuario que completó la misión.
   * Este proceso se ejecuta una sola vez para evitar duplicados.
   * 
   * - Obtiene el nombre de usuario desde `localStorage`.
   * - Construye dinámicamente la URL del endpoint a partir del `environment`.
   * - Envía una solicitud `PATCH` al backend para actualizar los créditos.
   *
   * @private
   * @returns {void}
   */
  private creditarCreditos(): void {
    // Evita múltiples acreditaciones
    if (this.creditedCredits) return;

    // Obtiene el nombre de usuario almacenado localmente
    const username = localStorage.getItem('username') || '';
    if (!username) return;

    // Determina la URL base de la API desde el environment
    const apiBase = String((environment as any)?.apiUrl || (environment as any)?.backendApi || '').replace(/\/+$/, '');
    if (!apiBase) return;

    // Construcción del endpoint y cuerpo de la solicitud
    const url = `${apiBase}/usuarios/${encodeURIComponent(username)}/creditos`;
    const body = { ['créditos']: this.CREDITOS_A_AGREGAR as number };

    // Realiza la petición PATCH para actualizar los créditos del usuario
    this.http.patch<any>(url, body).subscribe(
      () => { this.creditedCredits = true; },
      () => { this.creditedCredits = true; }
    );
  }
}