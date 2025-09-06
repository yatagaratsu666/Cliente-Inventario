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
 */

@Component({
  selector: 'app-app-gestion-item',
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './app-gestion-item.component.html',
  styleUrl: './app-gestion-item.component.css',
})
export class AppGestionItemComponent {
  // Lista de ítems obtenida desde el backend
  items: Item[] = [];

  constructor(private router: Router, private itemService: ItemsService) {}

  /**
   * Se ejecuta al iniciar el componente y carga los ítems.
   */
  ngOnInit(): void {
    this.showItems();
  }

    /**
   * Obtiene todos los ítems desde el backend
   * y los asigna a la propiedad `items`.
   */
  showItems(): void {
    this.itemService.showAllItems().subscribe({
      next: (data) => {
        this.items = data;
      },
      error: (error) => {
        console.error('Error al cargar items:', error);
        alert('No se pudo obtener la lista de items.');
      },
    });
  }

    /**
   * Redirige al formulario de creación de un nuevo ítem.
   */
  addItem(): void {
    this.router.navigate(['/items/create']);
  }

    /**
   * Cambia el estado (activo/inactivo) de un ítem específico.
   * @param id ID del ítem cuyo estado se desea cambiar
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
   * @param id ID del ítem a modificar
   */
  modifyItem(id: number): void {
    this.router.navigate(['/items/modify', id]);
  }
}
