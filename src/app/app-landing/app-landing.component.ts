import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

/**
 * AppLandingComponent
 *
 * Componente principal de la pantalla de aterrizaje (landing page) de la aplicación.
 *
 * Este componente sirve como punto de entrada inicial del usuario y permite:
 * - Mostrar la interfaz de bienvenida.
 * - Redirigir al usuario hacia la pantalla de inicio de sesión.
 * - Acceder directamente al menú principal del juego o aplicación.
 *
 * @property {Router} router - Servicio de enrutamiento para manejar la navegación entre pantallas.
 */
@Component({
  selector: 'app-app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app-landing.component.html',
  styleUrls: ['./app-landing.component.css']
})
export class AppLandingComponent {

  /**
   * Constructor del componente.
   *
   * Se utiliza para inyectar dependencias necesarias para la navegación entre pantallas.
   *
   * @param {Router} router - Servicio de enrutamiento de Angular utilizado para redirigir al usuario.
   */
  constructor(private router: Router) { }

  /**
   * Redirige al usuario a la pantalla de inicio de sesión.
   *
   * @returns {void}
   */
  onLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Redirige al usuario al menú principal de la aplicación.
   *
   * @returns {void}
   */
  onPlay(): void {
    this.router.navigate(['/menu']);
  }

}
