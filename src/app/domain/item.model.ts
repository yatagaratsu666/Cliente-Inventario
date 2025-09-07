import { Effect } from "./effect.model";

/**
 * Item
 *
 * Modelo de datos que representa un item dentro del juego.
 *
 * - Se usa para manejar toda la información relacionada con items disponibles.
 * - Incluye datos básicos (id, nombre, descripción, imagen).
 * - Asocia el item a un tipo de héroe (HeroType) para controlar compatibilidad.
 * - Maneja su estado (status) y cantidad disponible (stock).
 * - Contiene efectos especiales (Effect[]) que modifican estadísticas o añaden habilidades.
 * - dropRate define la probabilidad de obtener el item como drop en el juego.
 *
 * Uso común:
 * - Cargar el inventario de items desde el backend.
 * - Asignar items a héroes compatibles.
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

export class Item {
  id: number;
  image: string;
  heroType: HeroType;
  description: string;
  name: string;
  status: boolean;
  stock: number;
  effects: Effect[];
  dropRate: number;

  constructor(
    id: number = 0,
    image: string = '',
    heroType: HeroType = HeroType.TANK,
    description: string = '',
    name: string = '',
    status: boolean = true,
    stock: number = 0,
    effects: Effect[] = [],
    dropRate: number = 0,
  ) {
    this.id = id;
    this.image = image;
    this.heroType = heroType;
    this.description = description;
    this.name = name;
    this.effects = effects;
    this.dropRate = dropRate;
    this.status = status
    this.stock = stock;
  }
}
