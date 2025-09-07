import { Effect } from './effect.model';
import { HeroType } from './item.model';

/**
 * Weapon
 *
 * Modelo de datos que representa un arma dentro del juego.
 *
 * - Se usa para manejar toda la información relacionada con armas disponibles.
 * - Incluye datos básicos (id, nombre, descripción, imagen).
 * - Asocia el arma a un tipo de héroe (HeroType) para controlar compatibilidad.
 * - Maneja su estado (status) y cantidad disponible (stock).
 * - Contiene efectos especiales (Effect[]) que modifican estadísticas o añaden habilidades.
 * - dropRate define la probabilidad de obtener el arma como drop en el juego.
 *
 * Uso común:
 * - Cargar el inventario de armas desde el backend.
 * - Asignar armas a héroes compatibles.
 * - Mostrar detalles visuales (imagen, descripción, efectos) en la UI.
 */

export class Weapon {
  image: string;
  id: number;
  name: string;
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
    heroType: HeroType = HeroType.TANK,
    status: boolean = true,
    stock: number = 0,
    effects: Effect[] = [],
    dropRate: number = 0
  ) {
    this.id = id;
    this.image = image;
    this.description = description;
    this.name = name;
    this.heroType = heroType;
    this.effects = effects;
    this.dropRate = dropRate;
    this.status = status;
    this.stock = stock;
  }
}
