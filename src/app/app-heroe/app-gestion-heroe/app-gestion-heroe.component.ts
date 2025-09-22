import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Hero from '../../domain/heroe.model';
import { HeroesService } from '../../services/heroes.service';

/**
 * AppGestionHeroeComponent
 *
 * Componente Angular encargado de la gestión de héroes en el sistema.
 * Se encarga de:
 * - Listar todos los héroes registrados en el backend
 * - Navegar hacia la creación de nuevos héroes
 * - Navegar hacia la modificación de héroes existentes
 * - Cambiar el estado (activo/inactivo) de un héroe
 *
 * Características:
 * - Uso de `HeroesService` para la comunicación con el backend
 * - Manejo de rutas mediante `Router`
 * - Manejo de formularios y listas dinámicas
 *
 * @property {Hero[]} heros Lista de héroes obtenida desde el backend
 */
@Component({
  selector: 'app-app-gestion-heroe',
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './app-gestion-heroe.component.html',
  styleUrl: './app-gestion-heroe.component.css',
})
export class AppGestionHeroeComponent {
  heros: Hero[] = [];
  paginatedItems: Hero[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 8;
  selectedSlot: string = 'all'; // o el filtro que uses
  selectedArmor: Hero | null = null;

  constructor(private router: Router, private heroService: HeroesService) {}

  /**
   * Inicializa el componente y carga la lista de héroes.
   * @returns {void}
   */
  ngOnInit(): void {
    this.showHeros();
  }

  /**
   * Obtiene todos los héroes desde el backend
   * y los asigna a la propiedad `heros`.
   * @returns {void}
   */
  showHeros(): void {
    this.heroService.showAllIHeros().subscribe({
      next: (data) => {
        this.heros = data;
      },
      error: (error) => {
        console.error('Error al cargar heroes:', error);
        alert('No se pudo obtener la lista de héroes.');
      },
    });
  }

  getAvailableItems(slot: string): Hero[] {
    if (!slot || slot === 'all') {
      return this.heros;
    }
    return this.heros.filter((item) => item.heroType === slot);
  }

  openModal(item: Hero) {
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
   * Redirige al formulario de creación de un nuevo héroe.
   * @returns {void}
   */
  addHero(): void {
    this.router.navigate(['/heroes/create']);
  }

  /**
   * Cambia el estado (activo/inactivo) de un héroe específico.
   * @param {number} id ID del héroe cuyo estado se modificará
   * @returns {void}
   */
  changeStatus(id: number): void {
    this.heroService.changeStatus(id).subscribe({
      next: () => {
        const armor = this.heros.find((i) => i.id === id);
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
   * Redirige al formulario de modificación de un héroe existente.
   * @param {number} id ID del héroe a modificar
   * @returns {void}
   */
  modifyHero(id: number): void {
    this.router.navigate(['/heroes/modify', id]);
  }
}
