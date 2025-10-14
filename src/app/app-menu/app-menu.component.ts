import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

/**
 * AppMenuComponent
 *
 * Componente Angular que representa el menú principal del juego.
 *
 * Este componente se encarga de:
 * - Mostrar las opciones principales al usuario.
 * - Permitir la navegación hacia la sección de batallas o gestión de cuenta.
 *
 * Características:
 * - Utiliza `Router` para manejar la navegación.
 * - Implementa un diseño simple con integración de módulos comunes (`CommonModule`, `FormsModule`).
 *
 * @property {boolean} mostrarCuenta - Indica si la sección "Mi cuenta" está visible.
 * @property {string} jugadorNombre - Nombre del jugador mostrado en el menú.
 * @property {number} cantidadTokens - Cantidad de tokens actuales del jugador.
 * @property {Router} router - Servicio de enrutamiento para manejar la navegación.
 */
@Component({
  selector: 'app-app-menu',
  imports: [CommonModule, FormsModule],
  templateUrl: './app-menu.component.html',
  styleUrls: ['./app-menu.component.css']
})
export class AppMenuComponent {

  /** Indica si la sección "Mi cuenta" está visible */
  mostrarCuenta: boolean = false;

  /** Nombre del jugador mostrado en el menú */
  jugadorNombre: string = 'Jugador1';

  /** Cantidad de tokens actuales del jugador */
  cantidadTokens: number = 150;

  /**
   * Constructor del componente.
   *
   * Inyecta el servicio de enrutamiento para permitir la navegación entre vistas.
   *
   * @param {Router} router - Servicio de enrutamiento de Angular utilizado para redirigir al usuario.
   */
  constructor(private router: Router) { }

  /**
   * Alterna la visibilidad de la sección "Mi cuenta".
   *
   * @returns {void}
   */
  toggleCuenta(): void {
    this.mostrarCuenta = !this.mostrarCuenta;
  }
}
