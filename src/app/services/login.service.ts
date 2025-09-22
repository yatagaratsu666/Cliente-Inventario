/**
 * LoginService
 *
 * Servicio Angular para gestionar el inicio y cierre de sesión del usuario.
 * 
 * Funcionalidades:
 * - login: valida usuario y contraseña (temporalmente se utilizan usuarios estáticos)
 * - logout: limpia el estado de sesión
 * - isLoggedIn: verifica si el usuario tiene sesión activa
 */

import { Injectable } from '@angular/core';
import { RedirectCommand, Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly USERNAME1 = 'jugador1';
  private readonly PASSWORD1 = '5678';
  private readonly ROLE1 = 'player';
  private readonly USERNAME2 = 'admin1';
  private readonly PASSWORD2 = '5678';
  private readonly ROLE2: string = 'administrator';
  private readonly USERNAME3 = 'jugador2';
  private readonly PASSWORD3 = '5678';
  private readonly ROLE3 = 'player';

  constructor(private readonly router: Router) {}

    /**
   * Intenta iniciar sesión con las credenciales proporcionadas.
   *
   * Si son correctas, guarda en localStorage
   * el estado `loggedIn` y el `username` del usuario.
   *
   * @param username Nombre de usuario
   * @param password Contraseña
   * @returns Observable<boolean> true si se autenticó con éxito, error si no.
   */


  login(username: string, password: string): Observable<boolean> {
    if (username === this.USERNAME2 && password === this.PASSWORD2) {
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('username', username);
        this.router.navigate(['/battles']);
      localStorage.setItem('role',this.ROLE2)
      return of(true);
    }  else if ((username === this.USERNAME3 && password === this.PASSWORD3) || (username === this.USERNAME1 && password === this.PASSWORD1)) {
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('username', username);
        this.router.navigate(['/battles']);
      localStorage.setItem('role',this.ROLE3)
      return of(true);
    } else {
      return throwError(() => new Error('Usuario o contraseña incorrectos'));
    }
  }
  // Cierra la sesión del usuario limpiando el estado de LoggedIn
  logout(): void {
    localStorage.removeItem('loggedIn'); 
    localStorage.removeItem('username');
    localStorage.removeItem('role');
  }
  // Verifica si el usuario tiene sesión activa
  isLoggedIn(): boolean {
    return localStorage.getItem('loggedIn') === 'true';
  }

  getRole(): string | null {
  return localStorage.getItem('role');
}
}
