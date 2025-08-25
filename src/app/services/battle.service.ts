import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { ApiConfigService } from './api.config.service';
import { Room, RoomCreation } from '../domain/battle/room.model';
import { ActionType, HeroStats, RandomEffectType } from '../domain/battle/HeroStats.model';
import { HeroType } from '../domain/battle/HeroStats.model';


@Injectable({
  providedIn: 'root'
})
export class BattleService {
  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService
  ) {
    this.apiUrl = `${apiConfigService.getBattleUrl()}/api/rooms`;
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
    return this.http.post(`${this.apiUrl}/${roomId}/join`, { playerId, heroLevel, heroStats: stats }, { headers });
  }

  leaveRoom(roomId: string, playerId: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/${roomId}/leave`, { playerId }, { headers });
  }

  getHeroStatsByPlayerId(playerId: string) {
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

    /** ---------- Habilidades Maestras (Masters) ---------- */
    // IDs que espera el servidor
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
        health: 50,
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
  }

}