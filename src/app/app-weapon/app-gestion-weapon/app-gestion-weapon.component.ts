import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Weapon } from '../../domain/weapon.model';
import { WeaponsService } from '../../services/weapons.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

/**
 * AppGestionWeaponComponent
 *
 * Componente Angular para gestionar el listado de armas.
 * Se encarga de:
 * - Cargar todas las armas desde el backend
 * - Mostrar el listado de armas existentes
 * - Permitir cambiar el estado (activo/inactivo) de un arma
 * - Navegar hacia la creación de nuevas armas
 * - Navegar hacia la edición de armas existentes
 *
 * Características:
 * - Uso de `WeaponsService` para interactuar con la API
 * - Uso de `Router` para navegación entre vistas
 * - Manejo básico de errores con alertas y console.error
 * - Arquitectura basada en componentes standalone (usa imports propios)
 *
 * @property {Weapon[]} weapon Lista de armas cargadas desde el backend
 */
@Component({
  selector: 'app-app-gestion-weapon',
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './app-gestion-weapon.component.html',
  styleUrl: './app-gestion-weapon.component.css',
})
export class AppGestionWeaponComponent {
  weapon: Weapon[] = [];
  paginatedItems: Weapon[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 8;
  selectedSlot: string = 'all'; // o el filtro que uses
  selectedArmor: Weapon | null = null;

  constructor(private router: Router, private weaponService: WeaponsService) {}

  /**
   * Inicializa el componente cargando todas las armas disponibles al iniciar la vista.
   * @returns {void}
   */
  ngOnInit(): void {
    this.showWeapons();
  }

  /**
   * Navega a la vista para crear una nueva arma.
   * @returns {void}
   */
  addWeapon(): void {
    this.router.navigate(['/weapons/create']);
  }

  /**
   * Obtiene todas las armas desde el backend.
   * Maneja errores mostrando un mensaje en consola y alerta al usuario.
   * @returns {void}
   */
  showWeapons(): void {
    this.weaponService.showAllIWeapon().subscribe({
      next: (data) => {
        this.weapon = data;
      },
      error: (error) => {
        console.error('Error al cargar armas:', error);
        alert('No se pudo obtener la lista de armas.');
      },
    });
  }

  getAvailableItems(slot: string): Weapon[] {
    if (!slot || slot === 'all') {
      return this.weapon;
    }
    return this.weapon.filter((item) => item.heroType === slot);
  }

  openModal(item: Weapon) {
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
   * Cambia el estado (activo/inactivo) de un arma según su ID.
   * @param {number} id ID del arma a modificar
   * @returns {void}
   */
  changeStatus(id: number): void {
    this.weaponService.changeStatus(id).subscribe({
      next: () => {
        const armor = this.weapon.find((i) => i.id === id);
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
   * Navega a la vista para modificar un arma existente.
   * @param {number} id ID del arma a modificar
   * @returns {void}
   */
  modifyWeapon(id: number): void {
    this.router.navigate(['/weapons/modify', id]);
  }
}
