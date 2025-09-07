import { Effect } from "./effect.model";
import { HeroType } from "./item.model";

/**
 * Armor
 *
 * Modelo de datos que representa una pieza de armadura dentro del juego.
 *
 * - Se usa para manejar toda la información relacionada con armaduras disponibles.
 * - Incluye datos básicos (id, nombre, descripción, imagen).
 * - Define el tipo de pieza (ArmorType) y el tipo de héroe (HeroType) para controlar compatibilidad.
 * - Maneja su estado (status), cantidad disponible (stock) y probabilidad de drop (dropRate).
 * - Contiene efectos especiales (Effect[]) que modifican estadísticas o añaden habilidades.
 *
 * Uso común:
 * - Cargar el inventario de armaduras desde el backend.
 * - Asignar armaduras a héroes compatibles.
 * - Mostrar detalles visuales (imagen, descripción, efectos) en la UI.
 */

/**
 * Enum que define los tipos de piezas de armadura disponibles.
 * Cada valor representa una parte del equipo que un héroe puede llevar.
 */
export enum ArmorType {
    HELMET = 'HELMET',
    CHEST = 'CHEST',
    GLOVERS = 'GLOVERS',
    BRACERS = 'BRACERS',
    BOOTS = 'BOOTS',
    PANTS = 'PANTS'
}

/**
 * Clase que modela una pieza de armadura dentro del juego.
 * Las armaduras otorgan efectos, pueden estar asociadas a tipos de héroe
 * específicos y tienen probabilidad de drop (caída).
 */
export class Armor {
  image: string;
  id: number;
  name: string;
  armorType: ArmorType;
  heroType: HeroType;
  description: string;
  status: boolean;
  stock: number;
  effects: Effect[];
  dropRate: number;

    constructor(
      id: number = 0,
      image: string = '',
      description: string = '',
      name: string = '',
      armorType: ArmorType = ArmorType.HELMET,
      heroType: HeroType = HeroType.TANK,
      status: boolean = true,
      stock: number = 0,
      effects: Effect[] = [],
      dropRate: number = 0,
    ) {
      this.id = id;
      this.image = image;
      this.description = description;
      this.name = name;
      this.armorType = armorType;
      this.heroType = heroType;
      this.effects = effects;
      this.dropRate = dropRate;
      this.status = status
      this.stock = stock
    }
}
