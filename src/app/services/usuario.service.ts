import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import User from '../domain/user.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:1882/usuarios';

  constructor(private http: HttpClient) {
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
