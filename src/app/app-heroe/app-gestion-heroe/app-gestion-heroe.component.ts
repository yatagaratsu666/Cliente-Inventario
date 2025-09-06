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
  styleUrl: './app-gestion-heroe.component.css'
})
export class AppGestionHeroeComponent {
  heros: Hero[] = [];

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
        const hero = this.heros.find((i) => i.id === id);
        if (hero) {
          hero.status = !hero.status;
        }
      },
      error: (error) => {
        console.error('Error al cambiar el estado del héroe:', error);
        alert('No se pudo cambiar el estado del héroe.');
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
