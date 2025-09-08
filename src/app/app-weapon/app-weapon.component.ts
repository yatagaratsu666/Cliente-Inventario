/**
 * AppWeaponComponent
 *
 * Componente Angular encargado de manejar la vista de armas en la aplicación.
 *
 * Su función es:
 * - Servir como punto de entrada para mostrar el inventario de armas.
 * - Renderizar su template (`app-weapon.component.html`) con los estilos asociados.
 *
 * Uso común:
 * - Incluirlo en un módulo donde se necesite visualizar o gestionar armas.
 * - Conexión a servicios que proveen datos de armas para mostrarlos en la interfaz.
 *
 * Selector: `app-app-weapon`
 * Template: `./app-weapon.component.html`
 * Estilos: `./app-weapon.component.css`
 */

import { Component } from '@angular/core';

@Component({
  selector: 'app-app-weapon',
  imports: [],
  templateUrl: './app-weapon.component.html',
  styleUrl: './app-weapon.component.css'
})
export class AppWeaponComponent {

}
