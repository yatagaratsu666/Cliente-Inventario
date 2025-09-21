import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import User from '../domain/user.model';
import { ApiConfigService } from './api.config.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl: string;
  
    constructor(
      private http: HttpClient,
      private apiConfigService: ApiConfigService
    ) {
      // Construye la URL base combinando la URL de la API con el endpoint /heroes
      this.apiUrl = `${apiConfigService.getApiUrl()}/usuarios`;
    }

  getUsuarioById(nombreUsuario: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${nombreUsuario}`);
  }

  equipArmor(nombreUsuario: string, name: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${nombreUsuario}/equipArmor`, { armorName: name });
  }

  equipWeapon(nombreUsuario: string, name: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${nombreUsuario}/equipWeapon`, { weaponName: name });
  }

  equipItem(nombreUsuario: string, name: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${nombreUsuario}/equipItem`, { itemName: name });
  }

  equipEpic(nombreUsuario: string, name: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${nombreUsuario}/equipEpic`, { epicName: name });
  }

  equipHero(nombreUsuario: string, name: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${nombreUsuario}/equipHero`, { heroName: name });
  }

  unequipArmor(nombreUsuario: string, name: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${nombreUsuario}/unequipArmor`, { armorName: name });
  }

  unequipWeapon(nombreUsuario: string, name: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${nombreUsuario}/unequipWeapon`, { weaponName: name });
  }

  unequipItem(nombreUsuario: string, name: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${nombreUsuario}/unequipItem`, { itemName: name });
  }

  unequipEpic(nombreUsuario: string, name: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${nombreUsuario}/unequipEpic`, { epicName: name });
  }

  unequipHero(nombreUsuario: string, name: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${nombreUsuario}/unequipHero`, { heroName: name });
  }
}
