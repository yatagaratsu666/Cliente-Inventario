import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuctionService } from '../../services/auction.service';
import { ItemRef } from '../../domain/auction.model';
import { ItemsService } from '../../services/items.service';
import { firstValueFrom } from 'rxjs';
import { Item } from '../../domain/item.model';
import { UsuarioService } from '../../services/usuario.service';
import User from '../../domain/user.model';

export interface CreateAuctionInput {
  startingPrice: number;
  buyNowPrice: number | null;
  durationHours: number;
  itemId?: string;
}

/**
 * CreateAuctionFormComponent
 *
 * Componente encargado de gestionar la creación de nuevas subastas.
 *
 * Responsabilidades principales:
 * - Permitir al usuario seleccionar uno de sus ítems disponibles.
 * - Capturar los datos del formulario (precio inicial, precio de compra inmediata y duración).
 * - Enviar los datos al servicio de subastas para crear una nueva.
 * - Filtrar ítems por categoría según el inventario del usuario.
 *
 * @property {EventEmitter<CreateAuctionInput>} create - Evento emitido al crear una subasta.
 * @property {{id: string; name: string}[]} availableItems - Lista de ítems disponibles del usuario.
 * @property {string | undefined} itemId - ID del ítem actualmente seleccionado.
 * @property {ItemRef[]} allItems - Lista completa de ítems cargados desde el backend.
 * @property {CreateAuctionInput} form - Objeto que almacena los valores del formulario de creación.
 * @property {boolean} loading - Indica si el componente está en proceso de carga.
 */
@Component({
  selector: 'app-create-auction-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create-auction-form.component.html',
  styleUrls: ['./create-auction-form.component.css']
})
export class CreateAuctionFormComponent {
  /** Evento emitido cuando se crea una nueva subasta. */
  @Output() create = new EventEmitter<CreateAuctionInput>();

  /** Lista de ítems disponibles del usuario actual. */
  availableItems: { id: string; name: string }[] = [];

  /** ID del ítem seleccionado para la subasta. */
  itemId?: string;

  /** Lista completa de ítems del usuario (con metadatos). */
  allItems: ItemRef[] = [];

  /** Datos del formulario de creación de subasta. */
  form: CreateAuctionInput = { startingPrice: 0, buyNowPrice: null, durationHours: 24 };

  /** Indica si el componente está cargando información. */
  loading = true;

  /**
   * Constructor del componente.
   * Inicializa los servicios necesarios y carga los ítems del usuario.
   *
   * @param {AuctionService} auctionService - Servicio de gestión de subastas.
   * @param {Router} router - Servicio de enrutamiento Angular.
   * @param {ItemsService} itemsService - Servicio de manejo de ítems.
   * @param {UsuarioService} usuarioService - Servicio para obtener información del usuario.
   */
  constructor(
    private auctionService: AuctionService,
    private router: Router,
    private itemsService: ItemsService,
    private usuarioService: UsuarioService
  ) {
    this.loadUserItems();
  }

  /**
   * Carga los ítems disponibles del usuario logueado desde el backend.
   * Si el usuario no está autenticado, lanza un error.
   *
   * @returns {Promise<void>} Promesa que se resuelve al completar la carga.
   */
  async loadUserItems(): Promise<void> {
    try {
      const username = localStorage.getItem('username');
      if (!username) throw new Error('Usuario no logueado');

      const userItems = await this.auctionService.getUserItems(username);
      this.availableItems = userItems.map(i => ({ id: i.id, name: i.name ?? 'Sin nombre' }));

      if (userItems.length > 0) this.itemId = userItems[0].id;
    } catch (err) {
      console.error('Error cargando items:', err);
    } finally {
      this.loading = false;
    }
  }

  /**
   * Maneja los cambios de valores en los campos del formulario.
   *
   * @param {keyof Omit<CreateAuctionInput, 'itemId'>} field - Campo modificado.
   * @param {Event} event - Evento de cambio del input o select.
   * @returns {void}
   */
  handleInputChange(field: keyof Omit<CreateAuctionInput, 'itemId'>, event: Event): void {
    const target = event.target as HTMLInputElement | HTMLSelectElement;
    const value = target.value ? Number(target.value) : null;

    if (field === 'buyNowPrice') this.form.buyNowPrice = value;
    if (field === 'startingPrice') this.form.startingPrice = value ?? 0;
    if (field === 'durationHours') this.form.durationHours = value ?? 24;
  }

  /**
   * Envía los datos del formulario para crear una nueva subasta.
   * Valida que el usuario haya seleccionado un ítem válido.
   *
   * @returns {Promise<void>} Promesa que se resuelve tras intentar crear la subasta.
   */
  async submit(): Promise<void> {
    if (!this.itemId) return alert('Selecciona un item primero');

    const selected = this.allItems.find(i => i.id === this.itemId);
    if (!selected) return alert('Item no válido');

    const payload = {
      startingPrice: Number(this.form.startingPrice),
      buyNowPrice: this.form.buyNowPrice ? Number(this.form.buyNowPrice) : undefined,
      durationHours: Number(this.form.durationHours),
      itemId: this.itemId,
      itemType: selected.type
    };

    try {
      const auction = await this.auctionService.createAuction(payload);
      console.log('Subasta creada:', auction);
      alert('Subasta creada correctamente');
    } catch (err) {
      console.error('Error creando la subasta:', err);
      alert('No se pudo crear la subasta');
    }
  }

  /**
   * Navega a la vista de subastas activas.
   * @returns {void}
   */
  goToComprar(): void { this.router.navigate(['/auctions']); }

  /**
   * Navega a la vista de creación de subastas.
   * @returns {void}
   */
  goToVender(): void { this.router.navigate(['/auctions/vender']); }

  /**
   * Navega a la vista de retiro de artículos comprados.
   * @returns {void}
   */
  goToRecoger(): void { this.router.navigate(['/auctions/recoger']); }

  /**
   * Navega a la vista de subastas donde el usuario ha pujado.
   * @returns {void}
   */
  goToMisPujas(): void { this.router.navigate(['/auctions/mis-pujas']); }

  /**
   * Filtra los ítems del inventario según una categoría específica (armas, armaduras, etc.).
   *
   * @param {string} category - Categoría seleccionada para filtrar los ítems.
   * @returns {void}
   */
  filterByCategory(category: string): void {
    this.loading = true;
    const username = localStorage.getItem('username');

    if (!username) {
      console.error("No se encontró username en localStorage");
      this.loading = false;
      return;
    }

    this.usuarioService.getUsuarioById(username).subscribe({
      next: (usuario: User) => {
        let items: any[] = [];
        const inv = usuario.inventario || {};

        switch (category) {
          case 'armas': items = inv.weapons || []; break;
          case 'armaduras': items = inv.armors || []; break;
          case 'items': items = inv.items || []; break;
          case 'epicas': items = inv.epicAbility || []; break;
          case 'heroes': items = inv.hero || []; break;
          case 'all':
          default:
            items = [
              ...(inv.weapons || []),
              ...(inv.armors || []),
              ...(inv.items || []),
              ...(inv.epicAbility || []),
              ...(inv.hero || [])
            ];
            break;
        }

        this.allItems = items.map(i => ({
          ...i,
          id: String(i.id),
          type: category,
          imagen: i.image || 'https://via.placeholder.com/150'
        })) as ItemRef[];

        this.loading = false;
      },
      error: (err: any) => {
        console.error("Error cargando inventario:", err);
        this.loading = false;
      }
    });
  }
}