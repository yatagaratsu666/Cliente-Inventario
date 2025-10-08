import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';
import { MissionsService } from '../services/missions.service';

@Component({
  standalone: true,
  selector: 'app-enroll',
  imports: [CommonModule, FormsModule, RouterLink],
  styleUrls: ['./enroll.page.css'],
  template: `
    <section class="mision-container">
      <h2>Inscribirse a misión</h2>

      <div *ngIf="error" class="small error">{{ error }}</div>
      <div *ngIf="!missionId" class="small error">ID de misión no encontrado en la ruta.</div>

      <div *ngIf="missionId">
        <p><strong>Misión:</strong> {{ missionId }}</p>

        <!-- Panel estilo inventario -->
        <div class="equipment-panel card" style="padding: 12px;">
          <div class="equipment-row middle-row" style="gap: 16px; flex-wrap: wrap;">

            <!-- Héroe (seleccionable) -->
            <div class="equipment-slot hero" (click)="openEquipmentModal('hero')">
              <img *ngIf="selectedHero" [src]="selectedHero?.image" [alt]="selectedHero?.name">
              <span *ngIf="!selectedHero" class="slot-label">Héroe</span>
            </div>
            <div class="hero-info" style="min-width:260px;">
              <div class="hero-name"><strong>{{ selectedHero?.name || 'Sin héroe' }}</strong></div>
              <div class="hero-stats">
                <span>Ataque: {{ selectedHero?.attack ?? '-' }}</span>
                <span>Normal: ataque basico</span>
              </div>
            </div>

            <!-- Épica (seleccionable) -->
            <div class="equipment-slot epic-skill" (click)="openEquipmentModal('epicSkill')">
              <img *ngIf="selectedEpic" [src]="selectedEpic?.image" [alt]="selectedEpic?.name">
              <span *ngIf="!selectedEpic" class="slot-label">Épica</span>
            </div>
            <div class="hero-info" style="min-width:240px;">
              <div class="hero-name"><strong>{{ selectedEpic?.name || 'Sin épica' }}</strong></div>
            </div>
          </div>
        </div>

        <!-- Duración y acción -->
        <div style="margin-top:12px; display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
          <div class="small muted">Duración (segundos):</div>
          <div style="display:flex; gap:8px;">
            <button type="button" class="btn outline" (click)="setDuration(10)">10</button>
            <button type="button" class="btn outline" (click)="setDuration(22)">22</button>
            <button type="button" class="btn outline" (click)="setDuration(60)">60</button>
          </div>
          <input type="number" min="1" style="width:90px" [(ngModel)]="durationSeconds" placeholder="22" />
        </div>

        <div style="margin-top:12px;">
          <button
            type="button"
            class="btn success"
            (click)="enroll()"
            [disabled]="loading">
            {{ loading ? 'Inscribiendo…' : 'Inscribirse' }}
          </button>
          <a class="btn outline" [routerLink]="['/misiones']" style="margin-left:8px;">Volver a misiones</a>
        </div>
      </div>
    </section>

    <!-- Modal de selección -->
    <div class="modal-overlay" *ngIf="showEquipmentModal" (click)="closeEquipmentModal()">
      <div class="modal-content equipment-modal dark" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Seleccionar {{ selectedSlot === 'hero' ? 'Héroe' : 'Habilidad Épica' }}</h3>
          <button class="close-btn" (click)="closeEquipmentModal()">✕</button>
        </div>

        <div class="equipment-grid">
          <div
            *ngFor="let item of getPaginatedItems()"
            class="equipment-item"
            [class.item-selected]="selectedItem === item"
            (click)="selectedItem = item">
            <img [src]="item.image" [alt]="item.name">
            <div class="item-info">
              <span class="item-name">{{ item.name }}</span>
            </div>
          </div>
        </div>

        <div class="pagination-controls" *ngIf="getTotalPages() > 1">
          <button class="btn outline" (click)="previousPage()" [disabled]="currentPage === 1">Anterior</button>
          <span class="small muted">Página {{ currentPage }} de {{ getTotalPages() }}</span>
          <button class="btn outline" (click)="nextPage()" [disabled]="currentPage === getTotalPages()">Siguiente</button>
        </div>

        <div class="modal-actions">
          <button class="btn primary" (click)="equipSelectedItem()">Elegir</button>
          <button class="btn outline" (click)="closeEquipmentModal()">Cerrar</button>
        </div>
      </div>
    </div>
  `
})
export class EnrollPage implements OnInit {
  missionId: string | null = null;
  userId: string = localStorage.getItem('username') || '';
  user: any = null;

  // Selección actual
  selectedHero: any = null;
  selectedEpic: any = null;

  // Duración y acción
  durationSeconds?: number;
  loading = false;
  error: string | null = null;

  private readonly HCODE_RE = /^H-\d{3}$/i;

  private formatHCodeFromNumeric(n: number | string): string {
    const num = typeof n === 'number' ? n : parseInt(String(n), 10);
    if (Number.isNaN(num)) return '';
    return `H-${String(num).padStart(3, '0')}`;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: MissionsService,
    private userService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.missionId = this.route.snapshot.paramMap.get('id') || this.route.snapshot.paramMap.get('missionId');
    this.loadUserEquipment();
    if (this.durationSeconds == null) this.durationSeconds = 22; // valor por defecto
  }

  private loadUserEquipment() {
    if (!this.userId) return;
    this.userService.getUsuarioById(this.userId).subscribe({
      next: (data) => {
        this.user = data;
        // Igual que Inventario: prioriza equipados, luego inventario
        this.selectedHero = this.user?.equipados?.hero?.[0] || this.user?.inventario?.hero?.[0] || null;
        this.selectedEpic = this.user?.equipados?.epicAbility?.[0] || this.user?.inventario?.epicAbility?.[0] || null;
      },
      error: (err) => {
        this.error = err?.error?.error || 'No se pudo cargar el usuario.';
      }
    });
  }

  // Duración rápida
  setDuration(v: number) {
    this.durationSeconds = Number.isFinite(v as number) ? Number(v) : 22;
  }

  private coerceDuration(): number {
    const n = Number(this.durationSeconds);
    if (!Number.isFinite(n) || n <= 0) return 22;
    return Math.floor(n);
  }

  // Normaliza tokens para rotations (SPECIAL:<EPIC>)
  private normalizeToken(x?: string): string | null {
    if (!x || typeof x !== 'string') return null;
    const t = x.trim();
    if (!t) return null;
    return t.toUpperCase().replace(/\s+/g, '_');
  }

  // Deriva heroId H-### 
  private getMissionHeroId(): string | null {
    const h = this.selectedHero;

    // 1) Si el id es numérico (o string numérica), convertir a H-###
    if (typeof h?.id === 'number') {
      return this.formatHCodeFromNumeric(h.id);
    }
    if (typeof h?.id === 'string') {
      const idStr = h.id.trim().toUpperCase();
      if (this.HCODE_RE.test(idStr)) return idStr;         // ya viene como H-###
      if (/^\d+$/.test(idStr)) return this.formatHCodeFromNumeric(idStr); // "7" -> H-007
    }

    // 2) Otras claves posibles (code/heroId o input previo)
    const candidates = [
      h?.code,
      h?.heroId,
      typeof (this as any)['heroId'] === 'string' ? (this as any)['heroId'] : undefined
    ]
      .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
      .map(v => v.trim().toUpperCase());

    const match = candidates.find(v => this.HCODE_RE.test(v)) ||
                  candidates.find(v => /^\d+$/.test(v))?.replace(/^\d+$/, (m) => this.formatHCodeFromNumeric(m));
    return match || null;
  }

  enroll(): void {
    this.error = null;
    if (!this.missionId) { this.error = 'ID de misión inválido.'; return; }

    const heroId = this.getMissionHeroId();
    if (!heroId) { this.error = 'Selecciona un héroe que tenga ID válido (H-### o número).'; return; }

    const epicTok = this.normalizeToken(this.selectedEpic?.code || this.selectedEpic?.name || this.selectedEpic?.id || this.selectedEpic?._id);
    const rotations = [
      'BASIC',
      epicTok ? `SPECIAL:${epicTok}` : 'SPECIAL:BASIC',
      'ULT:MASTER'
    ];

    const duration = this.coerceDuration();

    this.loading = true;
    this.api.enroll(this.missionId!, heroId, rotations, duration).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res?.execId) this.router.navigate(['/missions', 'progress', res.execId]);
        else this.error = 'Inscripción OK pero no se recibió execId.';
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.error || err?.message || 'Error al inscribirse.';
      }
    });
  }

  // Modal
  showEquipmentModal = false;
  selectedSlot: 'hero' | 'epicSkill' = 'hero';
  itemsPerPage = 8;
  currentPage = 1;
  selectedItem: any = null;

  openEquipmentModal(slot: 'hero' | 'epicSkill'): void {
    this.selectedSlot = slot;
    this.currentPage = 1;
    this.selectedItem = null;
    this.showEquipmentModal = true;
  }
  closeEquipmentModal(): void {
    this.showEquipmentModal = false;
    this.selectedItem = null;
  }

  private getAvailableItems(): any[] {
    if (!this.user) return [];
    if (this.selectedSlot === 'hero') {
      const inv = this.user?.inventario?.hero || [];
      const eq = this.user?.equipados?.hero || [];
      return [...eq, ...inv].filter(Boolean);
    } else {
      const inv = this.user?.inventario?.epicAbility || [];
      const eq = this.user?.equipados?.epicAbility || [];
      return [...eq, ...inv].filter(Boolean);
    }
  }

  getPaginatedItems(): any[] {
    const all = this.getAvailableItems();
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return all.slice(start, start + this.itemsPerPage);
  }

  getTotalPages(): number {
    const all = this.getAvailableItems();
    return Math.max(1, Math.ceil(all.length / this.itemsPerPage));
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.selectedItem = null;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
      this.selectedItem = null;
    }
  }

  equipSelectedItem(): void {
    if (!this.selectedItem) return;

    if (this.selectedSlot === 'hero') {
      this.selectedHero = this.selectedItem;
    } else {
      this.selectedEpic = this.selectedItem;
    }
    this.closeEquipmentModal();
  }
}
