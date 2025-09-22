import { Component } from '@angular/core';
import { Item } from '../../domain/item.model';
import { ItemsService } from '../../services/items.service';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

/**
 * AppGestionItemComponent
 *
 * Componente Angular encargado de gestionar la lista de ítems.
 * Se encarga de:
 * - Mostrar todos los ítems registrados en el sistema
 * - Permitir la creación de nuevos ítems
 * - Cambiar el estado (activo/inactivo) de un ítem
 * - Redirigir al formulario de modificación de ítems
 *
 * Características:
 * - Uso de `ItemsService` para la comunicación con el backend
 * - Renderizado dinámico de la lista de ítems
 * - Navegación a rutas específicas para crear o modificar ítems
 *
 * @property {Item[]} items Lista de ítems obtenida desde el backend
 */
@Component({
  selector: 'app-app-gestion-item',
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './app-gestion-item.component.html',
  styleUrl: './app-gestion-item.component.css',
})
export class AppGestionItemComponent {
  items: Item[] = [];
  paginatedItems: Item[] = [];
currentPage: number = 1;
itemsPerPage: number = 8;
selectedSlot: string = 'all'; // o el filtro que uses
selectedItem: Item | null = null;

  constructor(private router: Router, private itemService: ItemsService) {}

  /**
   * Inicializa el componente y carga todos los ítems.
   * @returns {void}
   */
  ngOnInit(): void {
    this.showItems();
  }

  /**
   * Obtiene todos los ítems desde el backend
   * y los asigna a la propiedad `items`.
   * @returns {void}
   */
// Después de cargar los items
showItems(): void {
  this.itemService.showAllItems().subscribe({
    next: (data) => {
      this.items = data;

      // Inicializar paginación
      this.currentPage = 1;
      this.paginatedItems = this.getPaginatedItems(this.selectedSlot);
    },
    error: (error) => {
      console.error('Error al cargar items:', error);
      alert('No se pudo obtener la lista de items.');
    },
  });
}

// Paginación
getPaginatedItems(slot: string) {
  const allItems = this.getAvailableItems(slot) || [];
  const startIndex = (this.currentPage - 1) * this.itemsPerPage;
  return allItems.slice(startIndex, startIndex + this.itemsPerPage);
}

getTotalPages(slot: string): number {
  const allItems = this.getAvailableItems(slot) || [];
  return Math.max(1, Math.ceil(allItems.length / this.itemsPerPage));
}

previousPage() {
  if (this.currentPage > 1) {
    this.currentPage--;
    this.selectedItem = null;
    this.paginatedItems = this.getPaginatedItems(this.selectedSlot);
  }
}

nextPage(slot: string) {
  if (this.currentPage < this.getTotalPages(slot)) {
    this.currentPage++;
    this.selectedItem = null;
    this.paginatedItems = this.getPaginatedItems(slot);
  }
}

openModal(item: Item) {
  this.selectedItem = item;
}

closeModal() {
  this.selectedItem = null;
}

getAvailableItems(slot: string): Item[] {
  if (!slot || slot === 'all') {
    return this.items;
  }
  // Filtra por heroType, categoría o lo que uses como "slot"
  return this.items.filter(item => item.heroType === slot);
}



  /**
   * Redirige al formulario de creación de un nuevo ítem.
   * @returns {void}
   */
  addItem(): void {
    this.router.navigate(['/items/create']);
  }

  /**
   * Cambia el estado (activo/inactivo) de un ítem específico.
   * @param {number} id ID del ítem cuyo estado se desea cambiar
   * @returns {void}
   */
  changeStatus(id: number): void {
    this.itemService.changeStatus(id).subscribe({
      next: () => {
        const item = this.items.find((i) => i.id === id);
        if (item) {
          item.status = !item.status;
        }
      },
      error: (error) => {
        console.error('Error al cambiar el estado del item:', error);
        alert('No se pudo cambiar el estado del item.');
      },
    });
  }

  /**
   * Redirige al formulario de modificación de un ítem existente.
   * @param {number} id ID del ítem a modificar
   * @returns {void}
   */
  modifyItem(id: number): void {
    this.router.navigate(['/items/modify', id]);
  }
}
