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
import { ApiConfigService } from './api.config.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly USERNAME1 = 'jugador1';
  private readonly PASSWORD1 = '8765';
  private readonly ROLE1 = 'player';
  private readonly USERNAME2 = 'admin1';
  private readonly PASSWORD2 = '8765';
  private readonly ROLE2: string = 'administrator';
  private readonly USERNAME3 = 'jugador2';
  private readonly PASSWORD3 = '8765';
  private readonly ROLE3 = 'player';

  private apiUrl: string;

  constructor(private readonly router: Router, private apiConfig: ApiConfigService, private http: HttpClient) {
    this.apiUrl = this.apiConfig.getUsersUrl();
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
  login(username: string, password: string): Observable<boolean> {
    return new Observable<boolean>(subscriber => {

      // Intentar autenticación con el servidor remoto
      fetch('https://thenexusbattles-771648021041.southamerica-east1.run.app/api/usuarios/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apodo: username, password })
      })
        .then(async response => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          // Verificar el tipo de contenido
          const contentType = response.headers.get('content-type');
          let data;
          if (contentType && contentType.includes('application/json')) {
            data = await response.json();
          } else {
            data = await response.text();
          }

          console.log('Login response:', data);

          // Manejar JWT como texto o JSON con token
          if (typeof data === 'string' && data.startsWith('eyJ')) {
            // Token JWT como texto plano
            localStorage.setItem('authToken', data);
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('username', username);
            localStorage.setItem('role', username === this.USERNAME2 ? this.ROLE2 : 'player');
            this.router.navigate([username === this.USERNAME2 ? '/gestion' : '/battles']);
            subscriber.next(true);
            subscriber.complete();

          } else if (data && typeof data === 'object') {
            // Respuesta JSON
            if (data.token) {
              localStorage.setItem('authToken', data.token);
            }
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('username', username);
            localStorage.setItem('role', data.role || 'player');
            this.router.navigate([data.role === 'administrator' ? '/gestion' : '/battles']);
            subscriber.next(true);
            subscriber.complete();

          } else {
            throw new Error('Respuesta del servidor no válida');
          }
        })
        .catch(error => {
          console.warn('Error al autenticar online, usando fallback local:', error);


          if (username === this.USERNAME2 && password === this.PASSWORD2) {
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('username', username);
            localStorage.setItem('role', this.ROLE2);
            this.router.navigate(['/gestion']);
            subscriber.next(true);
            subscriber.complete();

          } else if (
            (username === this.USERNAME3 && password === this.PASSWORD3) ||
            (username === this.USERNAME1 && password === this.PASSWORD1)
          ) {
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('username', username);
            localStorage.setItem('role', 'player');
            this.router.navigate(['/battles']);
            subscriber.next(true);
            subscriber.complete();

          } else {
            subscriber.error(new Error('Usuario o contraseña incorrectos'));
          }
        });
    });
  }

  /**
   * Registra un nuevo usuario en el sistema.
   *
   * @param userData Datos del usuario a registrar
   * @returns Observable<any> Respuesta del servidor con el usuario creado
   */
  registerUser(userData: {
    nombres: string;
    apellidos: string;
    apodo: string;
    email: string;
    password: string;
  }): Observable<any> {
    const bodyAPI = {
      nombres: userData.nombres,
      apellidos: userData.apellidos,
      apodo: userData.apodo,
      email: userData.email,
      password: userData.password,
      confirmPassword: userData.password,
      acceptTerms: true
    };

    return new Observable<any>(subscriber => {
      fetch(`${this.apiUrl}/api/usuarios/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyAPI)
      })
        .then(async response => {
          const contentType = response.headers.get('content-type');
          let data: any;

          if (contentType && contentType.includes('application/json')) {
            data = await response.json();
          } else {
            data = await response.text();
          }

          if (!response.ok) {
            console.error('Error en registro 1:', data);
            throw new Error(`Registro 1 falló: ${response.statusText}`);
          }

          console.log('Registro 1 exitoso:', data);

          const userGame = {
            nombreUsuario: userData.apodo,
            rol: 'player',
            creditos: 1000,
            exp: 0,
            inventario: {},
            equipados: {}
          };

          return fetch(`http://146.148.77.95:1882/usuarios/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userGame)
          });
        })
        .then(async response => {
          if (!response) return;

          const contentType = response.headers.get('content-type');
          let gameData;

          if (contentType && contentType.includes('application/json')) {
            gameData = await response.json();
          } else {
            gameData = await response.text();
          }

          if (!response.ok) {
            console.warn('Error creando usuario en el servidor mio:', gameData);
            subscriber.next({ message: 'API principal OK, juego falló' });
            subscriber.complete();
            return;
          }

          console.log('Usuario creado en el servidor mio:', gameData);
          subscriber.next(gameData);
          subscriber.complete();
        })
        .catch(error => {
          console.error('Error durante registro completo:', error);
          subscriber.error(error);
        });
    });
  }



  /*login(username: string, password: string): Observable<boolean> {
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
  }*/
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
