import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

/**
 * AppitemComponent
 *
 * Componente Angular encargado de manejar la vista de items en la aplicación.
 *
 * Su función es:
 * - Servir como punto de entrada para mostrar el inventario de items.
 * - Renderizar su template (`app-weapon.component.html`) con los estilos asociados.
 *
 * Uso común:
 * - Incluirlo en un módulo donde se necesite visualizar o gestionar items.
 * - Conexión a servicios que proveen datos de armas para mostrarlos en la interfaz.
 *
 * Selector: `app-app-item`
 * Template: `./app-item.component.html`
 * Estilos: `./app-item.component.css`
 */

@Component({
  selector: 'app-app-item',
  imports: [RouterModule, CommonModule],
  templateUrl: './app-item.component.html',
  styleUrl: './app-item.component.css'
})
export class AppItemComponent {

}
