import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginService } from './services/login.service';
import { Router } from '@angular/router';
import { ChatService } from './services/chat.service';

/**
 * Componente raíz de la aplicación.
 *
 * - Muestra el layout base (definido en app.component.html).
 * - Gestiona funciones globales como cerrar sesión.
 * - Se encarga de inyectar servicios que pueden necesitarse a nivel global.
 */

@Component({
  selector: 'app-root',     // Nombre del componente raíz
  imports: [RouterModule, CommonModule], // Módulos necesarios para routing y utilidades comunes
  templateUrl: './app.component.html',  //template HTML del componente
  styleUrl: './app.component.css' //estilos CSS del componente
})
export class AppComponent {
  title = 'frontend-inv';

    /**
   * Constructor del componente.
   * Inyecta servicios globales:
   * - LoginService: manejo de autenticación / sesión.
   * - Router: para navegación programática entre rutas.
   * - ChatService: servicio de chat en tiempo real.
   */

  constructor(public loginService: LoginService, private router: Router, private chatService: ChatService) {}

    /**
   * Cierra sesión del usuario y redirige al login.
   */

  logout(): void {
    this.loginService.logout();
    this.router.navigate(['/login']);
  }
}
