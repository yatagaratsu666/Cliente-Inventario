import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Epic } from '../../domain/epic.model';
import { EpicsService } from '../../services/epics.service';

/**
 * AppGestionEpicaComponent
 *
 * Componente Angular encargado de gestionar la lista de épicas en el sistema.
 * Permite listar, crear, modificar y cambiar el estado de las épicas registradas
 * en el backend.
 *
 * @property {Epic[]} epic - Lista de épicas obtenidas desde el backend.
 */
@Component({
  selector: 'app-app-gestion-epica',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './app-gestion-epica.component.html',
  styleUrl: './app-gestion-epica.component.css',
})
export class AppGestionEpicaComponent {
  epic: Epic[] = [];
  paginatedItems: Epic[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 8;
  selectedSlot: string = 'all'; // o el filtro que uses
  selectedArmor: Epic | null = null;

  constructor(private router: Router, private epicService: EpicsService) {}

  /**
   * Inicializa el componente y carga las épicas disponibles.
   */
  ngOnInit(): void {
    this.showEpics();
  }

  /**
   * Redirige a la vista de creación de una nueva épica.
   */
  addEpic(): void {
    this.router.navigate(['/epics/create']);
  }

  /**
   * Obtiene todas las épicas desde el backend y las asigna a la propiedad `epic`.
   */
  showEpics(): void {
    this.epicService.showAllIEpics().subscribe({
      next: (data) => {
        this.epic = data;
      },
      error: (error) => {
        console.error('Error al cargar epicas:', error);
        alert('No se pudo obtener la lista de epicas.');
      },
    });
  }

  getAvailableItems(slot: string): Epic[] {
    if (!slot || slot === 'all') {
      return this.epic;
    }
    return this.epic.filter((item) => item.heroType === slot);
  }

  openModal(item: Epic) {
    this.selectedArmor = item;
  }

  closeModal() {
    this.selectedArmor = null;
  }

  getPaginatedArmors(slot: string) {
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
      this.selectedArmor = null;
      this.paginatedItems = this.getPaginatedArmors(this.selectedSlot);
    }
  }

  nextPage(slot: string) {
    if (this.currentPage < this.getTotalPages(slot)) {
      this.currentPage++;
      this.selectedArmor = null;
      this.paginatedItems = this.getPaginatedArmors(slot);
    }
  }

  /**
   * Cambia el estado (activo/inactivo) de una épica específica.
   *
   * @param {number} id - ID de la épica cuyo estado se desea modificar.
   */
  changeStatus(id: number): void {
    this.epicService.changeStatus(id).subscribe({
      next: () => {
        const armor = this.epic.find((i) => i.id === id);
        if (armor) {
          armor.status = !armor.status;
        }
      },
      error: (error) => {
        console.error('Error al cambiar el estado de la armadura:', error);
        alert('No se pudo cambiar el estado de la armadura.');
      },
    });
  }

  /**
   * Redirige a la vista de modificación de una épica existente.
   *
   * @param {number} id - ID de la épica que se desea modificar.
   */
  modifyEpic(id: number): void {
    this.router.navigate(['/epics/modify', id]);
  }
}
