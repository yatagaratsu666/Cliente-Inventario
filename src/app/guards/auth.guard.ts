import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { LoginService } from '../services/login.service';

/**
 * AuthGuard
 *
 * Guard de autenticación para rutas protegidas en Angular.
 * Se encarga de:
 * - Verificar si el usuario está logueado antes de permitirle acceder a ciertas rutas.
 * - Si el usuario no está autenticado, lo redirige automáticamente a la página de login.
 *
 * Uso típico:
 * Este guard se asocia a rutas mediante la propiedad `canActivate` en el enrutador, 
 * bloqueando el acceso a vistas sensibles hasta que el usuario cumpla con la condición de estar autenticado.
 */

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private loginService: LoginService, private router: Router) {}


    /**
   * Método principal de `CanActivate`.
   * Si el usuario está logueado, permite la navegación.
   * Si no, redirige al login y bloquea el acceso a la ruta solicitada.
   * 
   * @returns boolean — `true` si el acceso está permitido, `false` si se bloquea.
   */
  canActivate(): boolean {
    if (this.loginService.isLoggedIn()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
