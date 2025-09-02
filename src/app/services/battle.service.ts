import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { ApiConfigService } from './api.config.service';
import { HeroStats, RandomEffectType } from '../domain/battle/HeroStats.model';
import { HeroType } from '../domain/battle/HeroStats.model';
import { io, Socket } from 'socket.io-client';
import { catchError, Observable, tap, throwError } from 'rxjs';

function normalizeKey(s: string) {
  return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

type ActionType = "BASIC_ATTACK" | "SPECIAL_SKILL" | "MASTER_SKILL";

/** ---------- Habilidades Especiales (Specials) ---------- */
const ALL_SPECIALS: { id: string; name: string }[] = [
  // Tank
  { id: "GOLPE_ESCUDO", name: "Golpe con escudo" },
  { id: "MANO_PIEDRA", name: "Mano de piedra" },
  { id: "DEFENSA_FEROZ", name: "Defensa feroz" },
  // Warrior Arms
  { id: "EMBATE_SANGRIENTO", name: "Embate sangriento" },
  { id: "LANZA_DIOSES", name: "Lanza de los dioses" },
  { id: "GOLPE_TORMENTA", name: "Golpe de tormenta" },
  // Mage Fire
  { id: "MISILES_MAGMA", name: "Misiles de magma" },
  { id: "VULCANO", name: "Vulcano" },
  { id: "PARED_FUEGO", name: "Pared de fuego" },
  // Mage Ice
  { id: "LLUVIA_HIELO", name: "Lluvia de hielo" },
  { id: "CONO_HIELO", name: "Cono de hielo" },
  { id: "BOLA_HIELO", name: "Bola de hielo" },
  // Rogue Poison
  { id: "FLOR_LOTO", name: "Flor de loto" },
  { id: "AGONIA", name: "Agonía" },
  { id: "PIQUETE", name: "Piquete" },
  // Rogue Machete
  { id: "CORTADA", name: "Cortada" },
  { id: "MACHETAZO", name: "Machetazo" },
  { id: "PLANAZO", name: "Planazo" },
  // Shaman
  { id: "TOQUE_VIDA", name: "Toque de la vida" },
  { id: "VINCULO_NATURAL", name: "Vínculo natural" },
  { id: "CANTO_BOSQUE", name: "Canto del bosque" },
  // Medic
  { id: "CURACION_DIRECTA", name: "Curación directa" },
  { id: "NEUTRALIZACION_EFECTOS", name: "Neutralización de efectos" },
  { id: "REANIMACION", name: "Reanimación" },
];


const ALL_MASTERS: { id: string; name: string }[] = [
  { id: "MASTER.TANK_GOLPE_DEFENSA", name: "Golpe de Defensa" },
  { id: "MASTER.ARMS_SEGUNDO_IMPULSO", name: "Segundo Impulso" },
  { id: "MASTER.FIRE_LUZ_CEGADORA", name: "Luz Cegadora" },
  { id: "MASTER.ICE_FRIO_CONCENTRADO", name: "Frío Concentrado" },
  { id: "MASTER.VENENO_TOMA_LLEVA", name: "Toma y Lleva" },
  { id: "MASTER.MACHETE_INTIMIDACION_SANGRIENTA", name: "Intimidación Sangrienta" },
  { id: "MASTER.SHAMAN_TE_CHANGUA", name: "Té Changua" },
  { id: "MASTER.MEDIC_REANIMADOR_3000", name: "Reanimador 3000" },
];

const SPECIAL_NAME_TO_ID = Object.fromEntries(ALL_SPECIALS.map(s => [normalizeKey(s.name), s.id]));
const MASTER_NAME_TO_ID  = Object.fromEntries(ALL_MASTERS.map(m => [normalizeKey(m.name), m.id]));
const VALID_SPECIAL_IDS  = new Set(ALL_SPECIALS.map(s => s.id));
const VALID_MASTER_IDS   = new Set(ALL_MASTERS.map(m => m.id));

@Injectable({
  providedIn: 'root'
})
export class BattleService {
  private apiUrl: string;
  private socketUrl: string;
  private socket!: Socket;
  private currentBattle: any;

  

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService
  ) {
    this.apiUrl = `${apiConfigService.getBattleUrl()}/api/rooms`;
    this.socketUrl = `${apiConfigService.getBattleSocket()}`;
  }

setCurrentBattle(battleData: any) {
  this.currentBattle = battleData;
}

getCurrentBattle() {
  return this.currentBattle;
}

  createRoom(roomData: any) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}`, roomData, { headers });
  }

  getRooms() {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

joinRoom(roomId: string, playerId: string, heroLevel: number, stats: any) {
  const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  return this.http.post(`${this.apiUrl}/${roomId}/join`, 
    { playerId, heroLevel, heroStats: stats }, 
    { headers }
  ).pipe(
    tap(() => {
      // Solo conectas el socket si la llamada fue exitosa
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
      this.socket.emit("joinRoom", { roomId, player: { id: playerId, heroLevel } });
    }),
    catchError((error: HttpErrorResponse) => {
      // Aquí manejas el error 400 o cualquier otro
      if (error.status === 400) {
        console.error("Error 400: datos inválidos o sala no encontrada", error.error);
      } else {
        console.error("Otro error inesperado", error);
      }
      // Puedes relanzar el error para que el componente lo capture
      return throwError(() => error);
    })
  );
}

  toServerSkillId(input: string, type: "SPECIAL" | "MASTER"): string {
    const raw = (input || "").trim();
    if (!raw) return raw;
    const id = raw.toUpperCase().replace(/\s+/g, "_");
    if (type === "SPECIAL") {
      if (VALID_SPECIAL_IDS.has(id)) return id;
      const mapped = SPECIAL_NAME_TO_ID[normalizeKey(raw)];
      return mapped || raw;
    } else {
      if (VALID_MASTER_IDS.has(id)) return id;
      const mapped = MASTER_NAME_TO_ID[normalizeKey(raw)];
      return mapped || raw;
    }
  }

  sendBasic(targetId: string, roomId: string, sourcePlayerId: string) {
    const action = { type: "BASIC_ATTACK" as ActionType, sourcePlayerId, targetPlayerId: targetId };
    this.socket.emit("submitAction", { roomId, action });
    console.log(`[SEND] BASIC_ATTACK targetId=${targetId}`);
  }

  sendSpecial(input: string, targetId: string, roomId: string, sourcePlayerId: string) {
    const skillId = this.toServerSkillId(input, "SPECIAL");
    const action = { type: "SPECIAL_SKILL" as ActionType, sourcePlayerId, targetPlayerId: targetId, skillId };
    console.log(`[SEND] SPECIAL_SKILL skillId=${skillId}`);
    this.socket.emit("submitAction", { roomId, action });
  }

  sendMaster(input: string, targetId: string, roomId: string, sourcePlayerId: string) {
    const skillId = this.toServerSkillId(input, "MASTER");
    const action = { type: "MASTER_SKILL" as ActionType, sourcePlayerId, targetPlayerId: targetId, skillId };
    console.log(`[SEND] MASTER_SKILL skillId=${skillId}`);
    this.socket.emit("submitAction", { roomId, action });
}

  onReady(roomId: string, playerId: string, stats: any, team: string) {
    this.socket.emit("setHeroStats", { roomId, playerId, stats });
    this.socket.emit("playerReady", { roomId, playerId, team });
  }

  leaveRoom(roomId: string, playerId: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/${roomId}/leave`, { playerId }, { headers });
  }

  joinBattle(roomId: string, playerId: string) {
    this.socket.emit("joinBattle", { roomId, playerId});
  }

  listen<T>(eventName: string): Observable<T> {
    return new Observable<T>(subscriber => {
      this.socket.on(eventName, (data: T) => {
        subscriber.next(data);
      });
    });
  }

  getImageById(playerId: string){
    if (playerId === "admin") {
      return "https://i.ibb.co/Q3K7wHkK/guerrero-armas.png";
    } else {
      return "https://i.ibb.co/Q3K7wHkK/guerrero-armas.png";
    }
  }


  getHeroStatsByPlayerId(playerId: string) {
    if (playerId === 'admin') {
      /** ---------- Habilidades Especiales (Specials) ---------- */
      const ALL_SPECIALS: { id: string; name: string }[] = [
      // Warrior Arms
      { id: "EMBATE_SANGRIENTO", name: "Embate sangriento" },
      { id: "LANZA_DIOSES", name: "Lanza de los dioses" },
      { id: "GOLPE_TORMENTA", name: "Golpe de tormenta" },
    ];

    /** ---------- Habilidades Maestras (Masters) ---------- */
    // IDs que espera el servidor
    const ALL_MASTERS: { id: string; name: string }[] = [
      { id: "MASTER.ARMS_SEGUNDO_IMPULSO", name: "Segundo Impulso" },
    ];

    const SPECIAL_NAME_TO_ID = Object.fromEntries(ALL_SPECIALS.map(s => [normalizeKey(s.name), s.id]));
    const MASTER_NAME_TO_ID  = Object.fromEntries(ALL_MASTERS.map(m => [normalizeKey(m.name), m.id]));
    const VALID_SPECIAL_IDS  = new Set(ALL_SPECIALS.map(s => s.id));
    const VALID_MASTER_IDS   = new Set(ALL_MASTERS.map(m => m.id));

    function normalizeKey(s: string) {
      return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    }
    function toServerSkillId(input: string, type: "SPECIAL" | "MASTER"): string {
      const raw = (input || "").trim();
      if (!raw) return raw;
      const id = raw.toUpperCase().replace(/\s+/g, "_");
      if (type === "SPECIAL") {
        if (VALID_SPECIAL_IDS.has(id)) return id;
        const mapped = SPECIAL_NAME_TO_ID[normalizeKey(raw)];
        return mapped || raw;
      } else {
        if (VALID_MASTER_IDS.has(id)) return id;
        const mapped = MASTER_NAME_TO_ID[normalizeKey(raw)];
        return mapped || raw;
      }
    }

    /** ---------- Héroe de pruebas con TODAS las skills ---------- */
    const HERO_STATS = {
      hero: {
        heroType: "WARRIOR_ARMS",
        level: 1,
        power: 5,
        health: 5,
        defense: 10,
        attack: 10,
        attackBoost: { min: 0, max: 0 },
        damage: { min: 5, max: 5 },
        specialActions: ALL_SPECIALS.map(s => ({
          name: s.name,
          actionType: "ATTACK",
          powerCost: 1,
          cooldown: 0,
          isAvailable: true,
          effect: [],
        })),
        randomEffects: [
          { randomEffectType: "DAMAGE",        percentage: 55, valueApply: { min: 0, max: 0 } },
          { randomEffectType: "CRITIC_DAMAGE", percentage: 10, valueApply: { min: 2, max: 4 } },
          { randomEffectType: "EVADE",         percentage: 5,  valueApply: { min: 0, max: 0 } },
          { randomEffectType: "RESIST",        percentage: 10, valueApply: { min: 0, max: 0 } },
          { randomEffectType: "ESCAPE",        percentage: 0,  valueApply: { min: 0, max: 0 } },
          { randomEffectType: "NEGATE",        percentage: 20, valueApply: { min: 0, max: 0 } },
        ],
      },
      equipped: {
        items: [],
        armors: [],
        weapons: [],
        epicAbilites: ALL_MASTERS.map(m => ({
          name: m.name,
          compatibleHeroType: "WARRIOR_ARMS",
          effects: [],
          cooldown: 0,
          isAvailable: true,
          masterChance: 0.1,
        })),
      },
    };

    return HERO_STATS;
  }else {

        /** ---------- Specials ---------- */
    const ALL_SPECIALS: { id: string; name: string }[] = [
      { id: "GOLPE_ESCUDO", name: "Golpe con escudo" },
      { id: "MANO_PIEDRA", name: "Mano de piedra" },
      { id: "DEFENSA_FEROZ", name: "Defensa feroz" },
    ];

    /** ---------- Masters ---------- */
    const ALL_MASTERS: { id: string; name: string }[] = [
      { id: "MASTER.TANK_GOLPE_DEFENSA", name: "Golpe de Defensa" },
    ];

    const SPECIAL_NAME_TO_ID = Object.fromEntries(ALL_SPECIALS.map(s => [normalizeKey(s.name), s.id]));
    const MASTER_NAME_TO_ID  = Object.fromEntries(ALL_MASTERS.map(m => [normalizeKey(m.name), m.id]));
    const VALID_SPECIAL_IDS  = new Set(ALL_SPECIALS.map(s => s.id));
    const VALID_MASTER_IDS   = new Set(ALL_MASTERS.map(m => m.id));

    function normalizeKey(s: string) {
      return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    }
    function toServerSkillId(input: string, type: "SPECIAL" | "MASTER"): string {
      const raw = (input || "").trim();
      if (!raw) return raw;
      const id = raw.toUpperCase().replace(/\s+/g, "_");
      if (type === "SPECIAL") {
        if (VALID_SPECIAL_IDS.has(id)) return id;
        const mapped = SPECIAL_NAME_TO_ID[normalizeKey(raw)];
        return mapped || raw;
      } else {
        if (VALID_MASTER_IDS.has(id)) return id;
        const mapped = MASTER_NAME_TO_ID[normalizeKey(raw)];
        return mapped || raw;
      }
    }

    /** ---------- Héroe pruebas ---------- */
    const HERO_STATS = {
      hero: {
        heroType: "TANK",
        level: 1,
        power: 50,
        health: 100,
        defense: 10,
        attack: 11,
        attackBoost: { min: 0, max: 0 },
        damage: { min: 5, max: 5 },
        specialActions: ALL_SPECIALS.map(s => ({
          name: s.name,
          actionType: "ATTACK",
          powerCost: 1,
          cooldown: 0,
          isAvailable: true,
          effect: [],
        })),
        randomEffects: [
          { randomEffectType: "DAMAGE",        percentage: 55, valueApply: { min: 0, max: 0 } },
          { randomEffectType: "CRITIC_DAMAGE", percentage: 10, valueApply: { min: 2, max: 4 } },
          { randomEffectType: "EVADE",         percentage: 5,  valueApply: { min: 0, max: 0 } },
          { randomEffectType: "RESIST",        percentage: 10, valueApply: { min: 0, max: 0 } },
          { randomEffectType: "ESCAPE",        percentage: 0,  valueApply: { min: 0, max: 0 } },
          { randomEffectType: "NEGATE",        percentage: 20, valueApply: { min: 0, max: 0 } },
        ],
      },
      equipped: {
        items: [],
        armors: [],
        weapons: [],
        epicAbilites: ALL_MASTERS.map(m => ({
          name: m.name,
          compatibleHeroType: "TANK",
          effects: [],
          cooldown: 0,
          isAvailable: true,
          masterChance: 0.1,
        })),
      },
    };
    return HERO_STATS;
  }
}
}