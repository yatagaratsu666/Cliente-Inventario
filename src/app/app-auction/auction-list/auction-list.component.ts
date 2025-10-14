import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuctionCardComponent } from '../auction-card/auction-card.component';
import { AuctionDetailsComponent } from '../auction-details/auction-details.component';
import { AuctionDTO } from '../../domain/auction.model';
import { AuctionService } from '../../services/auction.service';
import { AuctionSocketService } from '../../services/auctionSocket.service';

/**
 * AuctionListComponent
 *
 * Componente principal encargado de mostrar, filtrar y actualizar dinámicamente
 * la lista de subastas activas dentro del sistema.
 *
 * Funcionalidades principales:
 * - Carga inicial de subastas desde el backend.
 * - Filtrado por nombre, tipo, duración o precio máximo.
 * - Conexión a WebSockets para recibir actualizaciones en tiempo real
 *   (creación, actualización y cierre de subastas).
 * - Apertura y cierre del panel de detalles de cada subasta.
 *
 * @property {AuctionDTO[]} auctions - Lista completa de subastas obtenidas desde el backend.
 * @property {AuctionDTO[]} filtered - Lista de subastas filtradas según los criterios actuales.
 * @property {string} filter - Texto de búsqueda ingresado por el usuario.
 * @property {AuctionDTO | undefined} selected - Subasta actualmente seleccionada para mostrar detalles.
 * @property {string | undefined} userId - ID del usuario autenticado.
 * @property {string} selectedType - Tipo de ítem seleccionado para filtrar.
 * @property {string} selectedDuration - Duración seleccionada para filtrar (en horas).
 * @property {number | undefined} maxPrice - Precio máximo permitido en el filtro.
 * @property {string[]} uniqueTypes - Tipos únicos de ítems disponibles entre las subastas.
 * @property {boolean} onlyMyBids - Indica si se deben mostrar solo las subastas donde el usuario ha pujado.
 */
@Component({
  selector: 'app-auction-list',
  standalone: true,
  templateUrl: './auction-list.component.html',
  styleUrls: ['./auction-list.component.css'],
  imports: [CommonModule, FormsModule, AuctionCardComponent, AuctionDetailsComponent]
})
export class AuctionListComponent implements OnInit, OnDestroy {
  /** Lista completa de subastas disponibles. */
  auctions: AuctionDTO[] = [];

  /** Lista filtrada según criterios de búsqueda. */
  filtered: AuctionDTO[] = [];

  /** Texto de búsqueda. */
  filter: string = '';

  /** Subasta actualmente seleccionada para ver detalles. */
  selected?: AuctionDTO;

  /** ID del usuario autenticado. */
  userId?: string;

  /** Subasta recibida por input desde otro componente. */
  @Input() auction!: AuctionDTO;

  /** Tipo de ítem seleccionado en el filtro. */
  selectedType: string = '';

  /** Duración seleccionada (ej. "24" o "48" horas). */
  selectedDuration: string = '';

  /** Precio máximo permitido en el filtro. */
  maxPrice?: number;

  /** Tipos únicos de ítems disponibles. */
  uniqueTypes: string[] = [];

  /** Si es verdadero, solo muestra las subastas donde el usuario ha pujado. */
  onlyMyBids: boolean = false;

  /** Lista de suscripciones activas a eventos del socket. */
  private subs: Subscription[] = [];

  /**
   * Constructor del componente.
   * @param {AuctionService} auctionService Servicio encargado de obtener subastas del backend.
   * @param {AuctionSocketService} auctionSocket Servicio WebSocket para actualizaciones en tiempo real.
   * @param {Router} router Servicio de enrutamiento Angular.
   * @param {ActivatedRoute} route Información de la ruta actual.
   */
  constructor(
    private auctionService: AuctionService,
    private auctionSocket: AuctionSocketService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  /**
   * Inicializa el componente cargando las subastas y configurando las suscripciones a sockets.
   */
  async ngOnInit() {
    this.userId = localStorage.getItem('userId') || undefined;
    this.onlyMyBids = this.route.snapshot.data['onlyMyBids'] ?? false;

    await this.loadAuctions();
    this.auctionSocket.connect();

    // Subasta actualizada en tiempo real
    this.subs.push(
      this.auctionSocket.onAuctionUpdated().subscribe(updated => {
        this.auctions = this.auctions.map(a =>
          a.id === updated.id ? { ...a, ...updated } : a
        );
        this.refreshTypes();
        this.applyFilter();
      })
    );

    // Nueva subasta
    this.subs.push(
      this.auctionSocket.onNewAuction().subscribe(created => {
        const exists = this.auctions.some(a => a.id === created.id);
        if (!exists) {
          this.auctions.push(created);
          this.refreshTypes();
          this.applyFilter();
        }
      })
    );

    // Subasta cerrada
    this.subs.push(
      this.auctionSocket.onAuctionClosed().subscribe(closed => {
        this.auctions = this.auctions.filter(a => a.id !== closed.id);
        if (this.selected?.id === closed.id) this.closeDetails();
        this.applyFilter();
      })
    );
  }

  /** Libera recursos y desconecta los sockets al destruir el componente. */
  ngOnDestroy() {
    this.auctionSocket.disconnect();
    this.subs.forEach(s => s.unsubscribe());
  }

  /**
   * Carga la lista de subastas desde el backend y aplica filtros iniciales.
   */
  private async loadAuctions() {
    try {
      const all = await this.auctionService.listAuctions();
      this.auctions = this.onlyMyBids && this.userId
        ? all.filter(a => a.bids?.some(b => b.userId === this.userId) && !a.isClosed)
        : all;
      this.auctions = Array.from(new Map(this.auctions.map(a => [a.id, a])).values());
      this.refreshTypes();
      this.applyFilter();
    } catch (err) {
      console.error('Error cargando subastas:', err);
    }
  }

  /** Actualiza la lista de tipos únicos de ítems disponibles. */
  private refreshTypes() {
    this.uniqueTypes = Array.from(new Set(
      this.auctions.map(a => a.item?.type).filter((t): t is string => !!t)
    ));
  }

  /**
   * Aplica filtros de búsqueda, tipo, duración y precio máximo.
   */
  applyFilter() {
    const q = this.filter.trim().toLowerCase();
    this.filtered = this.auctions.filter(a => {
      if (q.length >= 4) {
        const name = (a.item?.name ?? '').toLowerCase().trim();
        const desc = (a.item?.description ?? '').toLowerCase().trim();
        if (!name.includes(q) && !desc.includes(q)) return false;
      }
      if (this.selectedType && a.item?.type !== this.selectedType) return false;
      if (this.selectedDuration) {
        const ends = new Date(a.endsAt).getTime();
        const now = Date.now();
        const remainingHours = (ends - now) / (1000 * 60 * 60);
        if (this.selectedDuration === '24' && remainingHours > 24) return false;
        if (this.selectedDuration === '48' && remainingHours > 48) return false;
      }
      if (this.maxPrice && a.currentPrice > this.maxPrice) return false;
      return true;
    });

    if (q.length < 4 && !this.selectedType && !this.selectedDuration && !this.maxPrice) {
      this.filtered = [...this.auctions];
    }
  }

  /** Abre los detalles de una subasta. */
  openDetails(a: AuctionDTO) { this.selected = a; }

  /** Cierra la vista de detalles de la subasta. */
  closeDetails() { this.selected = undefined; }

  /**
   * Maneja el evento de compra inmediata, eliminando la subasta de la lista.
   * @param {AuctionDTO} updated - Subasta actualizada tras la compra.
   */
  handleBought(updated: AuctionDTO) {
    this.auctions = this.auctions.filter(a => a.id !== updated.id);
    this.applyFilter();
    if (this.selected?.id === updated.id) this.closeDetails();
  }

  /** Navega a la vista de todas las subastas. */
  goToComprar() { this.router.navigate(['/auctions']); }

  /** Navega a la vista para vender ítems. */
  goToVender() { this.router.navigate(['/auctions/vender']); }

  /** Navega a la vista para recoger artículos vendidos o ganados. */
  goToRecoger() { this.router.navigate(['/auctions/recoger']); }

  /** Navega a la vista con las subastas en las que el usuario ha participado. */
  goToMisPujas() { this.router.navigate(['/auctions/mis-pujas']); }

  /**
   * Filtra las subastas según la categoría seleccionada.
   * @param {string} category - Categoría por la que se quiere filtrar.
   */
  filterByCategory(category: string): void {
    this.router.navigate(['/auctions/vender']);
  }
}
