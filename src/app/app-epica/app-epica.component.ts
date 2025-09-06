import { Component } from '@angular/core';

/**
 * AppEpicComponent
 *
 * Componente Angular encargado de manejar la vista de las epicas en la aplicación.
 *
 * Su función es:
 * - Servir como punto de entrada para mostrar el inventario de epicas.
 * - Renderizar su template (`app-epica.component.html`) con los estilos asociados.
 *
 * Uso común:
 * - Incluirlo en un módulo donde se necesite visualizar o gestionar epicas.
 * - Conexión a servicios que proveen datos de epicas para mostrarlos en la interfaz.
 *
 * Selector: `app-app-epica`
 * Template: `./app-epica.component.html`
 * Estilos: `./app-epica.component.css`
 */

@Component({
  selector: 'app-app-epica',
  imports: [],
  templateUrl: './app-epica.component.html',
  styleUrl: './app-epica.component.css'
})
export class AppEpicaComponent {

}
