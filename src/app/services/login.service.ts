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

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, switchMap, throwError } from 'rxjs';
import { ApiConfigService } from './api.config.service';
import User from '../domain/user.model';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl: string;
  private readonly USERNAME = 'admin';
  private readonly PASSWORD = '1234';


  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService
  ) {
    this.apiUrl = `${apiConfigService.getApiUrl()}/usuarios/:id`;
  }

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


login(id: number, username: string, password: string): Observable<boolean> {
  return this.http.get<User>(`${this.apiConfigService.getApiUrl()}/usuarios/${id}`).pipe(
    switchMap(user => {
      if (user && user.nombreUsuario === username && user.contraseña === password) {
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('username', user.nombreUsuario);
        localStorage.setItem('userId', user.id.toString());
        return of(true);
      } else {
        return throwError(() => new Error('Usuario o contraseña incorrectos'));
      }
    })
  );
}


  // Cierra la sesión del usuario limpiando el estado de LoggedIn
  logout(): void {
    localStorage.removeItem('loggedIn');
  }
  // Verifica si el usuario tiene sesión activa
  isLoggedIn(): boolean {
    return localStorage.getItem('loggedIn') === 'true';
  }
}
