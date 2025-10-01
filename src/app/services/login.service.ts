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
      fetch(`${this.apiUrl}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })
      .then(async response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Verificar el tipo de contenido de la respuesta
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          // Si no es JSON, obtener como texto (probablemente un token)
          data = await response.text();
        }
        
        console.log('Login successful:', data);
        
        // Guardar el token si es texto plano, o procesar el JSON
        if (typeof data === 'string' && data.startsWith('eyJ')) {
          // Es un JWT token
          localStorage.setItem('authToken', data);
          localStorage.setItem('loggedIn', 'true');
          localStorage.setItem('username', username);
          // Determinar rol basado en el usuario (temporal)
          if (username === this.USERNAME2) {
            localStorage.setItem('role', this.ROLE2);
            this.router.navigate(['/gestion']);
          } else {
            localStorage.setItem('role', 'player');
            this.router.navigate(['/battles']);
          }
          subscriber.next(true);
          subscriber.complete();
        } else if (data && typeof data === 'object') {
          // Es un objeto JSON
          if (data.token) {
            localStorage.setItem('authToken', data.token);
          }
          localStorage.setItem('loggedIn', 'true');
          localStorage.setItem('username', username);
          localStorage.setItem('role', data.role || 'player');
          
          if (data.role === 'administrator') {
            this.router.navigate(['/gestion']);
          } else {
            this.router.navigate(['/battles']);
          }
          subscriber.next(true);
          subscriber.complete();
        } else {
          throw new Error('Respuesta del servidor no válida');
        }
      })
      .catch(error => {
        console.error('Error during login:', error);
        
        // Fallback a autenticación local si falla la online
        console.log('Intentando autenticación local...');
        if (username === this.USERNAME2 && password === this.PASSWORD2) {
          localStorage.setItem('loggedIn', 'true');
          localStorage.setItem('username', username);
          localStorage.setItem('role', this.ROLE2);
          this.router.navigate(['/gestion']);
          subscriber.next(true);
          subscriber.complete();
        } else if ((username === this.USERNAME3 && password === this.PASSWORD3) || (username === this.USERNAME1 && password === this.PASSWORD1)) {
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
  // construimos el body que la API espera
  const body = {
    nombres: userData.nombres,
    apellidos: userData.apellidos,
    apodo: userData.apodo,
    email: userData.email,
    password: userData.password,
    confirmPassword: userData.password, // mismo valor
    acceptTerms: true                   // siempre true
  };

  return new Observable<any>(subscriber => {
    fetch(`${this.apiUrl}/api/usuarios/register
`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    .then(async response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      console.log('User registration successful:', data);
      subscriber.next(data);
      subscriber.complete();
    })
    .catch(error => {
      console.error('Error during user registration:', error);
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
