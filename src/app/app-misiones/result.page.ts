import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MissionsService } from '../services/missions.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';

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
  execId!: string;
  data: any;
  private creditedXp = false;
  private creditedCredits = false;
  private readonly CREDITOS_A_AGREGAR = 20;

  constructor(
    private route: ActivatedRoute,
    private api: MissionsService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.execId = this.route.snapshot.paramMap.get('execId')!;
    this.api.result(this.execId).subscribe((r) => {
      this.data = r;
      this.creditarCreditos();
    });
  }

  private creditarCreditos() {
    if (this.creditedCredits) return;

    const username = localStorage.getItem('username') || '';
    if (!username) return;

    const apiBase = String((environment as any)?.apiUrl || (environment as any)?.backendApi || '').replace(/\/+$/, '');
    if (!apiBase) return;

    const url = `${apiBase}/usuarios/${encodeURIComponent(username)}/creditos`;
    const body = { ['créditos']: this.CREDITOS_A_AGREGAR as number }; // número, no string

    this.http.patch<any>(url, body).subscribe((resp) => {
      // resp.creditos es el número actualizado
      this.creditedCredits = true;
    }, () => {
      this.creditedCredits = true;
    });
  }
}
