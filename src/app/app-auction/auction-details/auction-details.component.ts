import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AuctionDTO } from '../../domain/auction.model';
import { AuctionService } from '../../services/auction.service';
import { AuctionSocketService } from '../../services/auctionSocket.service';
import { CommentService, CommentDTO } from '../../services/comment.service';

/**
 * AuctionDetailsComponent
 *
 * Componente Angular encargado de mostrar y gestionar los detalles de una subasta.
 * Incluye funcionalidades de actualización en tiempo real mediante sockets, 
 * gestión de pujas, compra inmediata y visualización de comentarios asociados al ítem.
 *
 * Funcionalidades principales:
 * - Mostrar los detalles actualizados de una subasta (precio, estado, pujas, etc.).
 * - Escuchar actualizaciones en tiempo real mediante `AuctionSocketService`.
 * - Permitir realizar pujas o comprar directamente un ítem.
 * - Consultar y mostrar comentarios y calificación promedio del ítem.
 *
 * @property {AuctionDTO | null} auction - Subasta inicial recibida como entrada.
 * @property {EventEmitter<void>} onClose - Evento emitido al cerrar el modal o panel de detalles.
 * @property {EventEmitter<AuctionDTO>} onBought - Evento emitido cuando el usuario compra un ítem.
 * @property {AuctionDTO} freshAuction - Copia local de la subasta, actualizada en tiempo real.
 * @property {number | undefined} editingBid - Valor de puja introducido por el usuario.
 * @property {CommentDTO[]} comments - Lista de comentarios asociados al ítem.
 * @property {number | null} averageRating - Calificación promedio del ítem.
 */
@Component({
  selector: 'app-auction-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auction-details.component.html',
  styleUrls: ['./auction-details.component.css']
})
export class AuctionDetailsComponent implements OnInit, OnDestroy {
  /** Subasta recibida desde el componente padre. */
  @Input() auction!: AuctionDTO | null;

  /** Evento emitido cuando el usuario cierra el panel o modal. */
  @Output() onClose = new EventEmitter<void>();

  /** Evento emitido cuando se realiza una compra directa. */
  @Output() onBought = new EventEmitter<AuctionDTO>();

  /** Copia local de la subasta con datos actualizados. */
  freshAuction!: AuctionDTO;

  /** Valor de puja en edición. */
  editingBid?: number;

  /** Lista de comentarios obtenidos desde el backend. */
  comments: CommentDTO[] = [];

  /** Calificación promedio del ítem. */
  averageRating: number | null = null;

  /** Suscripción activa al socket. */
  private sub?: Subscription;

  /**
   * Constructor del componente.
   * @param {AuctionService} auctionService Servicio encargado de la comunicación HTTP de subastas.
   * @param {AuctionSocketService} auctionSocket Servicio encargado de las actualizaciones en tiempo real.
   * @param {CommentService} commentService Servicio para obtener comentarios y calificaciones.
   */
  constructor(
    private auctionService: AuctionService,
    private auctionSocket: AuctionSocketService,
    private commentService: CommentService
  ) {}

  /**
   * Ciclo de vida de Angular.
   * Inicializa los datos de la subasta, carga comentarios y suscribe los sockets.
   */
  ngOnInit(): void {
    if (this.auction) {
      this.freshAuction = this.mergeAuctionLocal(this.auction, this.auction);
      this.fetchComments();
      this.fetchAuction();
      this.subscribeToSocket();
    }
  }

  /**
   * Desuscribe los sockets al destruir el componente.
   */
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.auctionSocket.disconnect();
  }

  /**
   * Suscribe el componente a los eventos del socket de subastas.
   * Actualiza los datos locales en tiempo real cuando hay cambios.
   */
  private subscribeToSocket(): void {
    const username = localStorage.getItem('username');
    this.auctionSocket.connect(username || undefined);

    this.sub = this.auctionSocket.onAuctionUpdated().subscribe(updated => {
      if (updated.id === this.freshAuction.id) {
        this.freshAuction = this.mergeAuctionLocal(this.freshAuction, updated);
      }
    });

    this.auctionSocket.onAuctionClosed().subscribe(closed => {
      if (closed.id === this.freshAuction.id) {
        this.freshAuction = this.mergeAuctionLocal(this.freshAuction, closed);
      }
    });
  }

  /**
   * Fusiona los datos locales con los actualizados recibidos por socket o backend.
   * Mantiene valores válidos cuando el nuevo objeto tiene propiedades nulas.
   *
   * @param {AuctionDTO} local Subasta actual almacenada localmente.
   * @param {AuctionDTO} updated Subasta recibida con datos actualizados.
   * @returns {AuctionDTO} Objeto fusionado con la información más reciente.
   */
  private mergeAuctionLocal(local: AuctionDTO, updated: AuctionDTO): AuctionDTO {
    const merged: AuctionDTO = {
      ...local,
      currentPrice: updated.currentPrice ?? local.currentPrice ?? 0,
      highestBid: updated.highestBid
        ? {
            ...updated.highestBid,
            userId: updated.highestBid.userId ?? local.highestBid?.userId ?? 'N/A'
          }
        : local.highestBid ?? null,
      highestBidderId: updated.highestBidderId ?? local.highestBidderId ?? 'N/A',
      bids: updated.bids ?? local.bids ?? [],
      endsAt: updated.endsAt ?? local.endsAt ?? undefined,
      isClosed: updated.isClosed ?? local.isClosed ?? false,
      item: {
        id: updated.item?.id ?? local.item?.id ?? 'N/A',
        userId: updated.item?.userId ?? local.item?.userId ?? 'N/A',
        name: updated.item?.name ?? local.item?.name ?? 'Sin nombre',
        isAvailable: updated.item?.isAvailable ?? local.item?.isAvailable ?? false,
        type: updated.item?.type ?? local.item?.type ?? 'Desconocido',
        description: updated.item?.description ?? local.item?.description ?? '',
        imagen: updated.item?.imagen ?? local.item?.imagen ?? ''
      }
    };

    return merged;
  }

  /**
   * Obtiene los datos actualizados de la subasta desde el backend.
   */
  async fetchAuction(): Promise<void> {
    if (!this.auction) return;
    try {
      const updated = await this.auctionService.getAuction(this.auction.id);
      if (updated) this.freshAuction = this.mergeAuctionLocal(this.freshAuction, updated);
    } catch (err) {
      console.error('Error fetching auction details:', err);
    }
  }

  /**
   * Obtiene los comentarios y la calificación promedio del ítem asociado a la subasta.
   */
  private fetchComments(): void {
    const item = this.freshAuction?.item;
    if (!item) {
      console.error('Item no disponible en la subasta.');
      return;
    }

    const itemId = Number(item.id);
    if (!itemId) {
      console.error('ID del item no válido.');
      return;
    }

    const type = item.type;
    if (!type) {
      console.error('Tipo de item no disponible.');
      return;
    }

    this.commentService.getItemComments(itemId, type).subscribe({
      next: res => {
        this.comments = res.comments ?? [];
        this.averageRating = res.stats?.average ?? null;

        const typeMap: Record<string, string> = {
          "Armaduras": "armor",
          "Héroes": "hero",
          "Armas": "weapon",
          "Ítems": "item",
          "Habilidades especiales": "epic"
        };

        const prop = typeMap[type];
        if (prop && res.product?.[prop]) {
          this.freshAuction.item = {
            ...this.freshAuction.item,
            ...res.product[prop]
          };
        }
      },
      error: err => console.error('Error fetching comments:', err)
    });
  }

  /**
   * Cierra el panel o modal de detalles y emite el evento `onClose`.
   */
  close(): void {
    this.onClose.emit();
  }

  /**
   * Envía una puja al backend si el monto es válido y superior al actual.
   * Luego actualiza la subasta local con los nuevos datos.
   */
  async placeBid(): Promise<void> {
    if (!this.freshAuction || this.editingBid == null) return;

    const bidAmount = Number(this.editingBid);
    if (bidAmount <= (this.freshAuction.currentPrice ?? 0)) return;

    const username = localStorage.getItem('username');
    if (!username) return;

    try {
      await this.auctionService.placeBid(this.freshAuction.id, bidAmount);
      const updated = await this.auctionService.getAuction(this.freshAuction.id);
      if (updated) this.freshAuction = this.mergeAuctionLocal(this.freshAuction, updated);
    } catch (err) {
      console.error('Error placing bid:', err);
    }
  }

  /**
   * Ejecuta la compra inmediata del ítem si está disponible.
   * Al completarse, emite el evento `onBought` con la subasta actualizada.
   */
  async buyNow(): Promise<void> {
    if (!this.freshAuction || !this.freshAuction.buyNowPrice) return;
    try {
      const updated = await this.auctionService.buyNow(this.freshAuction.id);
      if (updated) {
        this.freshAuction = this.mergeAuctionLocal(this.freshAuction, updated);
        this.onBought.emit(this.freshAuction);
      }
    } catch (err) {
      console.error('Error buying now:', err);
    }
  }

  /**
   * Calcula el tiempo restante antes de que finalice la subasta.
   *
   * @param {string} [endIso] Fecha de finalización en formato ISO.
   * @returns {string} Tiempo restante en formato "Xh Ym" o "Finalizada" si ya terminó.
   */
  getRemaining(endIso?: string): string {
    if (!endIso) return 'N/A';
    const diff = new Date(endIso).getTime() - Date.now();
    if (diff <= 0) return 'Finalizada';
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${h}h ${m}m`;
  }
}
