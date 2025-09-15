import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { ApiConfigService } from './api.config.service';
import { io, Socket } from 'socket.io-client';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { UsuarioService } from './usuario.service';
import User from '../domain/user.model';

type ActionType = 'BASIC_ATTACK' | 'SPECIAL_SKILL' | 'MASTER_SKILL';

@Injectable({
  providedIn: 'root',
})
export class BattleService {
  private apiUrl: string;
  private socketUrl: string;
  private socket!: Socket;
  private currentBattle: any;

  private masterMap: Record<string, string> = {
    "Golpe de defensa": "MASTER.TANK_GOLPE_DEFENSA",
    "Segundo Impulso": "MASTER.ARMS_SEGUNDO_IMPULSO",
    "Luz cegadora": "MASTER.FIRE_LUZ_CEGADORA",
    "Frio concentrado": "MASTER.ICE_FRIO_CONCENTRADO",
    "Toma Y Lleva": "MASTER.VENENO_TOMA_LLEVA",
    "Intimidacion sangrienta": "MASTER.MACHETE_INTIMIDACION_SANGRIENTA",
    "Te Changua": "MASTER.SHAMAN_TE_CHANGUA",
    "Reanimador 3000": "MASTER.MEDIC_REANIMADOR_3000",
  };


  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService,
    private usuarioService: UsuarioService
  ) {
    this.apiUrl = `${apiConfigService.getBattleUrl()}/api/rooms`;
    this.socketUrl = `${apiConfigService.getBattleSocket()}`;
  }

  // ====== Control de batalla actual ======
  setCurrentBattle(battleData: any) {
    this.currentBattle = battleData;
  }

  getCurrentBattle() {
    return this.currentBattle;
  }

  // ====== Salas ======
  createRoom(roomData: any) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}`, roomData, { headers });
  }

  getRooms() {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  joinRoom(roomId: string, playerId: string, heroLevel: number, stats: any) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http
      .post(
        `${this.apiUrl}/${roomId}/join`,
        { playerId, heroLevel, heroStats: stats },
        { headers }
      )
      .pipe(
        tap(() => {
          this.socket = io(this.socketUrl, {
            withCredentials: true,
            autoConnect: true,
            transports: ['polling'],
            upgrade: false,
            rejectUnauthorized: false,
            reconnectionDelay: 1000,
            reconnection: true,
            reconnectionAttempts: 10,
            agent: false,
          });
          this.socket.emit('joinRoom', {
            roomId,
            player: { id: playerId, heroLevel },
          });
        }),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 400) {
            console.error(
              'Error 400: datos inválidos o sala no encontrada',
              error.error
            );
          } else {
            console.error('Otro error inesperado', error);
          }
          return throwError(() => error);
        })
      );
  }

  // ====== Acciones ======
  sendBasic(targetId: string, roomId: string, sourcePlayerId: string) {
    const action = {
      type: 'BASIC_ATTACK' as ActionType,
      sourcePlayerId,
      targetPlayerId: targetId,
    };
    this.socket.emit('submitAction', { roomId, action });
    console.log(`[SEND] BASIC_ATTACK targetId=${targetId}`);
  }

  sendSpecial(
    skillId: string,
    targetId: string,
    roomId: string,
    sourcePlayerId: string
  ) {
    const action = {
      type: 'SPECIAL_SKILL' as ActionType,
      sourcePlayerId,
      targetPlayerId: targetId,
      skillId,
    };
    this.socket.emit('submitAction', { roomId, action });
    console.log(`[SEND] SPECIAL_SKILL skillId=${skillId}`);
  }

  sendMaster(
    skillId: string,
    targetId: string,
    roomId: string,
    sourcePlayerId: string
  ) {
    const action = {
      type: 'MASTER_SKILL' as ActionType,
      sourcePlayerId,
      targetPlayerId: targetId,
      skillId: this.masterMap[skillId] || skillId,
    };
    this.socket.emit('submitAction', { roomId, action });
    console.log(`[SEND] MASTER_SKILL skillId=${skillId}`);
  }

  onReady(roomId: string, playerId: string, stats: any, team: string) {
    this.socket.emit('setHeroStats', { roomId, playerId, stats });
    this.socket.emit('playerReady', { roomId, playerId, team });
  }

  leaveRoom(roomId: string, playerId: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(
      `${this.apiUrl}/${roomId}/leave`,
      { playerId },
      { headers }
    );
  }

  joinBattle(roomId: string, playerId: string) {
    this.socket.emit('joinBattle', { roomId, playerId });
  }

  listen<T>(eventName: string): Observable<T> {
    return new Observable<T>((subscriber) => {
      this.socket.on(eventName, (data: T) => {
        subscriber.next(data);
      });
    });
  }

  getImageById(playerId: string): Observable<string> {
    return new Observable((observer) => {
      this.usuarioService.getUsuarioById(playerId).subscribe({
        next: (user: User) => {
          if (!user || !user.equipados || !user.equipados.hero.length) {
            observer.error('El usuario no tiene héroes configurados');
            return;
          }

          const heroImage = user.equipados.hero[0].image;

          observer.next(heroImage);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  getHeroStatsByPlayerId(playerId: string): Observable<any> {
    return new Observable((observer) => {
      this.usuarioService.getUsuarioById(playerId).subscribe({
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
