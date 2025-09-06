import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Hero from '../../domain/heroe.model';
import { HeroesService } from '../../services/heroes.service';

/**
 * Componente encargado de la gestión de héroes dentro del sistema.
 * Permite listar, crear, modificar y cambiar el estado de los héroes
 * registrados en el backend.
 *
 * Características principales:
 * - Obtiene todos los héroes mediante el servicio `HeroesService`.
 * - Permite navegar hacia la creación o modificación de héroes.
 * - Cambia el estado (activo/inactivo) de un héroe.
 *
 */

@Component({
  selector: 'app-app-gestion-heroe',
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './app-gestion-heroe.component.html',
  styleUrl: './app-gestion-heroe.component.css'
})
export class AppGestionHeroeComponent {
  // Lista de heroes traidos del backend
  heros: Hero[] = [];

  constructor(private router: Router, private heroService: HeroesService) {}

  
  /**
   * Llama a la función para cargar los héroes al iniciar el componente.
   */
  ngOnInit(): void {
    this.showHeros();
  }

  
  /**
   * Obtiene la lista completa de héroes desde el backend
   * y la asigna a la propiedad `heros`.
   */
  showHeros(): void {
    this.heroService.showAllIHeros().subscribe({
      next: (data) => {
        this.heros = data;
      },
      error: (error) => {
        console.error('Error al cargar items:', error);
        alert('No se pudo obtener la lista de items.');
      },
    });
  }

  
  /**
   * Navega hacia la vista de creación de héroes.
   */
  addHero(): void {
    this.router.navigate(['/heroes/create']);
  }

    /**
   * Cambia el estado (activo/inactivo) de un héroe específico.
   * @param id ID del héroe cuyo estado se modificará.
   */
  changeStatus(id: number): void {
    this.heroService.changeStatus(id).subscribe({
      next: () => {
        const item = this.heros.find((i) => i.id === id);
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
   * Navega hacia la vista de modificación de un héroe.
   * @param id ID del héroe a modificar.
   */
  modifyHero(id: number): void {
    this.router.navigate(['/heroes/modify', id]);
  }
}
