import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import User from '../domain/user.model';
import { ApiConfigService } from './api.config.service';

@Injectable({
  providedIn: 'root',
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

  CreateUser(userData: {
    nombres: string;
    apellidos: string;
    apodo: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, userData);
  }

  getUsuarioById(nombreUsuario: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${nombreUsuario}`);
  }

  equipArmor(nombreUsuario: string, name: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${nombreUsuario}/equipArmor`, {
      armorName: name,
    });
  }

  equipWeapon(nombreUsuario: string, name: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${nombreUsuario}/equipWeapon`, {
      weaponName: name,
    });
  }

  equipItem(nombreUsuario: string, name: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${nombreUsuario}/equipItem`, {
      itemName: name,
    });
  }

  equipEpic(nombreUsuario: string, name: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${nombreUsuario}/equipEpic`, {
      epicName: name,
    });
  }

  equipHero(nombreUsuario: string, name: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${nombreUsuario}/equipHero`, {
      heroName: name,
    });
  }

  unequipArmor(nombreUsuario: string, name: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${nombreUsuario}/unequipArmor`, {
      armorName: name,
    });
  }

  unequipWeapon(nombreUsuario: string, name: string): Observable<User> {
    return this.http.put<User>(
      `${this.apiUrl}/${nombreUsuario}/unequipWeapon`,
      { weaponName: name }
    );
  }

  unequipItem(nombreUsuario: string, name: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${nombreUsuario}/unequipItem`, {
      itemName: name,
    });
  }

  unequipEpic(nombreUsuario: string, name: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${nombreUsuario}/unequipEpic`, {
      epicName: name,
    });
  }

  unequipHero(nombreUsuario: string, name: string): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${nombreUsuario}/unequipHero`, {
      heroName: name,
    });
  }

  getHeroStatsByPlayerId(playerId: string): Observable<any> {
    return new Observable((observer) => {
      this.getUsuarioById(playerId).subscribe({
        next: (user: User) => {
          if (!user || !user.equipados || !user.equipados.hero) {
            observer.error('El usuario no tiene héroe equipado');
            return;
          }

          const hero = user.equipados.hero[0];

          const heroStats = {
            hero: {
              name: hero.name,
              heroType: hero.heroType,
              level: hero.level,
              image: hero.image,
              power: hero.power,
              health: hero.health,
              defense: hero.defense,
              attack: hero.attack,
              attackBoost: hero.attackBoost,
              damage: hero.damage,
              specialActions: hero.specialActions,
              effects: hero.effects || [],
              randomEffects: hero.randomEffects || [],
            },
            equipped: {
              items: (user.equipados.items || []).map((item) => ({
                name: item.name,
                image: item.image,
                heroType: item.heroType,
                effects: item.effects,
                dropRate: item.dropRate,
              })),
              armors: (user.equipados.armors || []).map((armor) => ({
                name: armor.name,
                image: armor.image,
                heroType: armor.heroType,
                armorType: armor.armorType,
                effects: armor.effects,
                dropRate: armor.dropRate,
              })),
              weapons: (user.equipados.weapons || []).map((weapon) => ({
                name: weapon.name,
                image: weapon.image,
                heroType: weapon.heroType,
                effects: weapon.effects,
                dropRate: weapon.dropRate,
              })),
              epicAbilities: (user.equipados.epicAbility || []).map((epic) => ({
                name: epic.name,
                image: epic.image,
                compatibleHeroType: epic.heroType,
                effects: epic.effects,
                cooldown: epic.cooldown,
                isAvailable: epic.isAvailable,
                masterChance: epic.masterChance,
              })),
            },
          };
          observer.next(heroStats);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }
}
