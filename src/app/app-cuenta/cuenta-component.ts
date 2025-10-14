import { Component, Input, OnInit } from '@angular/core';
import { UsuarioService } from '../services/usuario.service';
import User from '../domain/user.model';
import { CommonModule } from '@angular/common';
import { LoginService } from '../services/login.service';
import { Router } from '@angular/router';
import { AppLoginComponent } from '../app-login/app-login.component';

/**
 * CuentaComponent
 *
 * Componente encargado de manejar la **vista y control de la cuenta del usuario**.
 *
 * Responsabilidades principales:
 * - Mostrar los datos del usuario autenticado.
 * - Permitir el cierre de sesión (logout).
 * - Cargar la información del usuario al iniciar el componente.
 *
 * @property {User | null} user - Objeto con los datos del usuario actual.
 * @property {string} username - Nombre de usuario obtenido desde `localStorage`.
 * @property {string} role - Rol del usuario actual.
 * @property {boolean} isOpen - Indica si el panel de cuenta está visible.
 */
@Component({
  selector: 'app-cuenta',
  templateUrl: './cuenta-component.html',
  styleUrls: ['./cuenta-component.css'],
  imports: [CommonModule, AppLoginComponent],
})
export class CuentaComponent implements OnInit {
  /** Datos del usuario autenticado */
  user: User | null = null;

  /** Nombre de usuario obtenido desde `localStorage` */
  username = localStorage.getItem('username') ?? '';

  /** Rol del usuario obtenido desde `localStorage` */
  role = localStorage.getItem('role') ?? '';

  /** Estado de apertura del panel de cuenta */
  @Input() isOpen = false;

  /**
   * Constructor del componente.
   * Inyecta los servicios de usuario, autenticación y enrutamiento.
   *
   * @param {UsuarioService} userService - Servicio para obtener datos del usuario.
   * @param {LoginService} loginService - Servicio para manejar el inicio/cierre de sesión.
   * @param {Router} router - Servicio de navegación entre rutas.
   */
  constructor(
    private userService: UsuarioService,
    private loginService: LoginService,
    private router: Router
  ) {}

  /**
   * Inicializa el componente cargando la información del usuario autenticado.
   * Si no hay nombre de usuario en el almacenamiento local, no realiza la petición.
   *
   * @returns {void}
   */
  ngOnInit(): void {
    if (this.username) {
      this.userService.getUsuarioById(this.username).subscribe({
        next: (data) => {
          this.user = data;
        },
        error: (error) => {
          console.error('Error al cargar el usuario:', error);
        }
      });
    }
  }

  /**
   * Cierra la sesión actual del usuario y redirige al login.
   *
   * @returns {void}
   */
  logout(): void {
    this.close();
    this.loginService.logout();
    this.router.navigate(['/login']);
  }

  /**
   * Cierra el panel de cuenta.
   *
   * @returns {void}
   */
  close(): void {
    this.isOpen = false;
  }

  /**
   * Método reservado para cambiar el avatar del usuario.
   * Actualmente sin implementación.
   *
   * @returns {void}
   */
  changeAvatar(): void {
    // vacío porque aún no se define la funcionalidad
  }
}
