import { Component } from '@angular/core';

/**
 * AppHeroeComponent
 *
 * Componente Angular encargado de manejar la vista de heroes en la aplicación.
 *
 * Su función es:
 * - Servir como punto de entrada para mostrar el inventario de heroes.
 * - Renderizar su template (`app-heroe.component.html`) con los estilos asociados.
 *
 * Uso común:
 * - Incluirlo en un módulo donde se necesite visualizar o gestionar herores.
 * - Conexión a servicios que proveen datos de heroes para mostrarlos en la interfaz.
 *
 * Selector: `app-app-heroe`
 * Template: `./app-heroe.component.html`
 * Estilos: `./app-heroe.component.css`
 */

@Component({
  selector: 'app-app-heroe',
  imports: [],
  templateUrl: './app-heroe.component.html',
  styleUrl: './app-heroe.component.css'
})
export class AppHeroeComponent {

}
