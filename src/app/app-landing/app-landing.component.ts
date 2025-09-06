import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

/**
 * AppLandingComponent
 *
 * Componente Angular para la pantalla de aterrizaje (landing page) de la aplicación.
 * Se encarga de:
 * - Servir como punto de entrada inicial para el usuario
 * - Ofrecer opciones para iniciar sesión o ir directamente al menú principal
 * - Redirigir al login o al menú según la acción del usuario
 *
 */

@Component({
  selector: 'app-app-landing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app-landing.component.html',
  styleUrls: ['./app-landing.component.css']
})

export class AppLandingComponent {

  constructor(private router: Router) { }

  // Redirige al usuario al login
  onLogin() {
    this.router.navigate(['/login']);
  }

  // Redirige al usuario al menú principal
  onPlay() {
    this.router.navigate(['/menu']);
  }

}
