import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

/**
 * AppMenuComponent
 *
 * Componente Angular que representa el menú principal del juego.
 * Se encarga de:
 * - Mostrar las opciones principales al usuario
 * - Permitir iniciar la navegación hacia la sección de batallas
 *
 * Características:
 * - Uso de `Router` para redirigir al usuario al presionar "Play"
 * - Diseño simple, integrando módulos comunes (`CommonModule`, `FormsModule`)
 */

@Component({
  selector: 'app-app-menu',
  imports: [CommonModule, FormsModule],
  templateUrl: './app-menu.component.html',
  styleUrls: ['./app-menu.component.css']
})
export class AppMenuComponent {

  mostrarCuenta = false;
  jugadorNombre = 'Jugador1';
  cantidadTokens = 150;

  constructor(private router: Router) { }
  
  /**
   * Navega a la vista de batallas al presionar el botón "Play".
   */
  onPlay() {
    this.router.navigate(['/battles']);
  }
  /**
   * Navega a la vista del inventario al presionar el botón "Mi Inventario".
   */
  onInventory() {
    this.router.navigate(['/inventory']); // Redirige a la ruta "/inventory"
  }
  /**
 * Alterna la visibilidad del contenedor "Mi cuenta".
 */
  toggleCuenta() {
    this.mostrarCuenta = !this.mostrarCuenta;
  }
}
