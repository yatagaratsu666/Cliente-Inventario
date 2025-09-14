import { Effect } from "./effect.model";

/**
 * Hero
 *
 * Modelo de datos que representa un héroe dentro del juego.
 *
 * - Se usa para manejar toda la información relacionada con héroes disponibles.
 * - Incluye datos básicos (id, nombre, descripción, imagen).
 * - Asocia el héroe a un tipo de héroe (HeroType) para controlar compatibilidad.
 * - Maneja su estado (status) y cantidad disponible (stock).
 * - Contiene efectos especiales (Effect[]) que modifican estadísticas o añaden habilidades.
 * - dropRate define la probabilidad de obtener el héroe como drop en el juego.
 *
 * Uso común:
 * - Cargar el inventario de héroes desde el backend.
 * - Asignar héroes a otros héroes compatibles.
 * - Mostrar detalles visuales (imagen, descripción, efectos) en la UI.
 */

export enum HeroType {
  TANK = 'TANK',
  WEAPONS_PAL = 'WEAPONS_PAL',
  FIRE_MAGE = 'FIRE_MAGE',
  ICE_MAGE = 'ICE_MAGE',
  POISON_ROGUE = 'POISON_ROGUE',
  SHAMAN = 'SHAMAN',
  MEDIC = 'MEDIC',
  MACHETE = 'MACHETE'
}

export default class Hero {
  image: string;
  id: number;
  name: string;
  heroType: HeroType;
  description: string;
  level: number;
  power: number;
  health: number;
  defense: number;
  status: boolean;
  stock: number;
  attack: number;
  attackBoost: { min: number; max: number };
  damage: { min: number; max: number };
  specialActions: {
    name: string;
    actionType: string;
    powerCost: number;
    cooldown: number;
    isAvailable: boolean;
  }[];
  effects: Effect[];
  randomEffects: {
    randomEffectType: string;
    percentage: number;
    valueApply: { min: number; max: number };
  }[];

  constructor(
    image: string = '',
    name: string = '',
    heroType: HeroType = HeroType.TANK,
    description: string = '',
    level: number = 1,
    power: number = 0,
    health: number = 0,
    defense: number = 0,
    status: boolean = true,
    stock: number = 0,
    attack: number = 0,
    attackBoost: { min: number; max: number } = { min: 0, max: 0 },
    damage: { min: number; max: number } = { min: 0, max: 0 },
    specialActions: {
      name: string;
      actionType: string;
      powerCost: number;
      cooldown: number;
      isAvailable: boolean;
    }[] = [],
    id: number = 0,
    effects: Effect[] = [],
    randomEffects: {
      randomEffectType: string;
      percentage: number;
      valueApply: { min: number; max: number };
    }[] = []
  ) {
    this.image = image;
    this.name = name;
    this.heroType = heroType;
    this.description = description;
    this.level = level;
    this.power = power;
    this.health = health;
    this.defense = defense;
    this.status = status;
    this.stock = stock;
    this.attack = attack;
    this.attackBoost = attackBoost;
    this.damage = damage;
    this.specialActions = specialActions;
    this.id = id;
    this.effects = effects;
    this.randomEffects = randomEffects
  }
}
