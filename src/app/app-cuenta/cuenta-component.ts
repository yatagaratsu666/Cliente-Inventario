import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

/**
 * CuentaComponent
 * 
 * Componente Angular que maneja la visualización de la información de la cuenta del jugador.
 * Se encarga de:
 * - Mostrar u ocultar el contenedor con la información del jugador y sus tokens.
 * 
 * Características:
 * - `mostrarCuenta`: Controla la visibilidad del contenedor de la cuenta.
 * - `jugadorNombre`: Almacena el nombre del jugador (valor estático por ahora).
 * - `cantidadTokens`: Almacena la cantidad de tokens del jugador (valor estático por ahora).
 * - `toggleCuenta()`: Alterna la visibilidad del contenedor de la cuenta.
 */

@Component({
  selector: 'app-cuenta',
  templateUrl: './cuenta-component.html',
  styleUrls: ['./cuenta-component.css'],
  imports: [CommonModule]
})
export class CuentaComponent {
  mostrarCuenta = false;
  jugadorNombre = 'Jugador1'; // Nombre del jugador estático por ahora
  cantidadTokens = 150; // Tokens estáticos

  /**
   * Alterna la visibilidad del contenedor "Mi cuenta".
   * Cambia el valor de 'mostrarCuenta' entre verdadero y falso.
   */
  toggleCuenta() {
    this.mostrarCuenta = !this.mostrarCuenta;
  }
}
