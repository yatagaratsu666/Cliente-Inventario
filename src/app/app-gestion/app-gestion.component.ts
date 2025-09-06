import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

/**
 * AppGestionComponent
 *
 * Componente principal de gestión que funciona como menú de navegación
 * hacia los distintos módulos de administración del sistema:
 * Héroes, Ítems, Épicas, Armaduras y Armas.
 *
 * Características principales:
 * - Contiene accesos directos a cada sección de gestión.
 * - Utiliza el Router de Angular para redirigir a los módulos correspondientes.
 *
 * @property {Router} router - Servicio de Angular Router para navegación entre vistas.
 */
@Component({
  selector: 'app-app-gestion',
  imports: [RouterModule, CommonModule],
  templateUrl: './app-gestion.component.html',
  styleUrl: './app-gestion.component.css'
})
export class AppGestionComponent {
  /**
   * Constructor del componente.
   * @param {Router} router Servicio de Angular Router para navegación.
   */
  constructor(private router: Router) {}

  /**
   * Redirige al módulo de gestión de héroes.
   */
  goToHeroes(): void {
    this.router.navigate(['/heroes/control']);
  }

  /**
   * Redirige al módulo de gestión de ítems.
   */
  goToItems(): void {
    this.router.navigate(['/items/control']);
  }

  /**
   * Redirige al módulo de gestión de épicas.
   */
  goToEpics(): void {
    this.router.navigate(['/epics/control']);
  }

  /**
   * Redirige al módulo de gestión de armaduras.
   */
  goToArmors(): void {
    this.router.navigate(['/armors/control']);
  }

  /**
   * Redirige al módulo de gestión de armas.
   */
  goToWeapons(): void {
    this.router.navigate(['/weapons/control']);
  }
}
