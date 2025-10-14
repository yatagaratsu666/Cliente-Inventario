import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuctionDTO } from '../../domain/auction.model';
import { AuctionService } from '../../services/auction.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';
import { AuctionSocketService } from '../../services/auctionSocket.service';
import { Subscription } from 'rxjs';

/**
 * TransactionHistoryComponent
 *
 * Componente encargado de mostrar el historial de transacciones del usuario (subastas compradas y vendidas).
 * Además, se mantiene actualizado mediante sockets para reflejar nuevas transacciones en tiempo real.
 *
 * @property {AuctionDTO[]} purchased - Lista de subastas compradas por el usuario.
 * @property {AuctionDTO[]} sold - Lista de subastas vendidas por el usuario.
 * @property {Record<string, string>} usernames - Diccionario que asocia IDs de usuarios con nombres de usuario.
 * @property {string | undefined} username - Nombre de usuario actual (obtenido de localStorage).
 * @property {Subscription[]} subs - Lista de suscripciones activas al servicio de sockets.
 */
@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.css']
})
export class TransactionHistoryComponent implements OnInit, OnDestroy {

  /** Lista de subastas compradas por el usuario */
  purchased: AuctionDTO[] = [];

  /** Lista de subastas vendidas por el usuario */
  sold: AuctionDTO[] = [];

  /** Diccionario que asocia IDs de usuario con nombres */
  usernames: Record<string, string> = {};

  /** Nombre de usuario actual */
  private username?: string;

  /** Suscripciones activas al servicio de sockets */
  private subs: Subscription[] = [];

  /**
   * Constructor del componente.
   * Inicializa los servicios necesarios para cargar los datos del historial de subastas.
   *
   * @param {AuctionService} auctionService - Servicio para interactuar con el backend de subastas.
   * @param {HttpClient} http - Cliente HTTP para obtener datos adicionales de usuarios.
   * @param {Router} router - Servicio de enrutamiento.
   * @param {AuctionSocketService} auctionSocket - Servicio que gestiona la comunicación en tiempo real mediante WebSockets.
   */
  constructor(
    private auctionService: AuctionService,
    private http: HttpClient,
    private router: Router,
    private auctionSocket: AuctionSocketService
  ) {}

  /**
   * Inicializa el componente obteniendo el historial de subastas
   * y estableciendo la conexión con el servidor de sockets.
   * @returns {void}
   */
  ngOnInit(): void {
    this.username = localStorage.getItem('username') || undefined;

    if (!this.username) {
      console.log('[TransactionHistory] esperando username...');
      return;
    }

    this.fetchHistory();

    // Conexión al socket
    this.auctionSocket.connect();

    // Escucha nuevas transacciones
    this.subs.push(
      this.auctionSocket.onTransactionCreated().subscribe(() => {
        this.fetchHistory();
      })
    );
  }

  /**
   * Libera las suscripciones activas y desconecta el socket
   * al destruir el componente.
   * @returns {void}
   */
  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.auctionSocket.disconnect();
  }

  /**
   * Obtiene desde el backend las subastas compradas y vendidas por el usuario actual.
   * También actualiza el mapa de nombres de usuario asociados.
   * @returns {Promise<void>}
   */
  async fetchHistory(): Promise<void> {
    if (!this.username) return;

    try {
      const [purchasedRes, soldRes] = await Promise.all([
        this.auctionService.getPurchasedAuctions(this.username),
        this.auctionService.getSoldAuctions(this.username)
      ]);

      console.log('[fetchHistory] purchased:', purchasedRes);
      console.log('[fetchHistory] sold:', soldRes);

      this.purchased = purchasedRes ?? [];
      this.sold = soldRes ?? [];

      const ids = Array.from(new Set([
        ...this.purchased.map(a => a.item?.userId).filter(Boolean) as string[],
        ...this.sold.map(a => a.highestBidderId).filter(Boolean) as string[]
      ]));

      await Promise.all(ids.map(async id => {
        if (!this.usernames[id]) {
          this.usernames[id] = await this.fetchUsername(id);
        }
      }));

    } catch (err) {
      console.error('[TransactionHistory] Error fetching history', err);
    }
  }

  /**
   * Obtiene el nombre de usuario correspondiente a un ID desde el backend.
   * @param {string} id - ID del usuario a buscar.
   * @returns {Promise<string>} Nombre de usuario o 'N/A' si no se encuentra.
   */
  private async fetchUsername(id: string): Promise<string> {
    try {
      const res = await this.http.get<{ username: string }>(
        `${environment.api.base}/users/${id}`
      ).toPromise();
      return res?.username || 'N/A';
    } catch {
      return 'N/A';
    }
  }

  /**
   * Obtiene el nombre del vendedor de una subasta.
   * @param {AuctionDTO} a - Objeto de tipo AuctionDTO.
   * @returns {string} Nombre del vendedor o 'N/A'.
   */
  getSellerName(a: AuctionDTO): string {
    return a.item?.userId ? this.usernames[a.item.userId] || '...' : 'N/A';
  }

  /**
   * Obtiene el nombre del comprador de una subasta.
   * @param {AuctionDTO} a - Objeto de tipo AuctionDTO.
   * @returns {string} Nombre del comprador o 'N/A'.
   */
  getBuyerName(a: AuctionDTO): string {
    return a.highestBidderId ? this.usernames[a.highestBidderId] || '...' : 'N/A';
  }

  // Métodos de navegación -----------------------------------------------------

  /** Navega a la vista de subastas disponibles para comprar */
  goToComprar(): void { this.router.navigate(['/auctions']); }

  /** Navega a la vista de creación de subastas */
  goToVender(): void { this.router.navigate(['/auctions/vender']); }

  /** Navega a la vista de recolección de objetos subastados */
  goToRecoger(): void { this.router.navigate(['/auctions/recoger']); }

  /** Navega a la vista de las pujas del usuario */
  goToMisPujas(): void { this.router.navigate(['/auctions/mis-pujas']); }
}
