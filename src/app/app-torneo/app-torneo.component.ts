/**
 * AppTorneoComponent
 *
 * Componente encargado de manejar la vista principal del módulo de torneos.
 * Permite al usuario navegar hacia las secciones de inscripción o participación en torneos.
 *
 * Responsabilidades principales:
 * - Mostrar las opciones del torneo disponibles para el usuario.
 * - Gestionar la navegación hacia las rutas de inscripción y participación.
 *
 * @property {Router} router - Servicio de enrutamiento usado para la navegación entre vistas.
 */

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-torneo',
  imports: [CommonModule, FormsModule],
  templateUrl: './app-torneo.component.html',
  styleUrls: ['./app-torneo.component.css']
})
export class AppTorneoComponent {

  /**
   * Constructor del componente.
   * Inyecta el servicio de enrutamiento para permitir la navegación entre rutas del módulo de torneo.
   *
   * @param {Router} router - Servicio de Angular para redirigir entre rutas.
   */
  constructor(private router: Router) { }

  /**
   * Redirige al usuario hacia la página de inscripción del torneo.
   *
   * @returns {void}
   */
  onInscripcion(): void {
    this.router.navigate(['/torneo/Inscripcion']);
  }

  /**
   * Redirige al usuario hacia la vista principal del torneo (participación o listado).
   *
   * @returns {void}
   */
  onParticipar(): void {
    this.router.navigate(['/torneo']);
  } 
}
