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

  getUsuarioById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  equipArmor(userId: string, name: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/equipArmor`, { armorName: name });
  }

  equipWeapon(userId: string, name: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/equipWeapon`, { weaponName: name });
  }

  equipItem(userId: string, name: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/equipItem`, { itemName: name });
  }

  equipEpic(userId: string, name: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/equipEpic`, { epicName: name });
  }

  equipHero(userId: string, name: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/equipHero`, { heroName: name });
  }

  unequipArmor(userId: string, name: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/unequipArmor`, { armorName: name });
  }

  unequipWeapon(userId: string, name: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/unequipWeapon`, { weaponName: name });
  }

  unequipItem(userId: string, name: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/unequipItem`, { itemName: name });
  }

  unequipEpic(userId: string, name: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/unequipEpic`, { epicName: name });
  }

  unequipHero(userId: string, name: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}/unequipHero`, { heroName: name });
  }
}
