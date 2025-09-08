import { Effect } from "./effect.model";

/**
 * Epic
 *
 * Modelo de datos que representa una epica dentro del juego.
 *
 * - Se usa para manejar toda la información relacionada con épicas disponibles.
 * - Incluye datos básicos (id, nombre, descripción, imagen).
 * - Asocia la épica a un tipo de héroe (HeroType) para controlar compatibilidad.
 * - Maneja su estado (status) y cantidad disponible (stock).
 * - Contiene efectos especiales (Effect[]) que modifican estadísticas o añaden habilidades.
 * - dropRate define la probabilidad de obtener la épica como drop en el juego.
 *
 * Uso común:
 * - Cargar el inventario de épicas desde el backend.
 * - Asignar épicas a héroes compatibles.
 * - Mostrar detalles visuales (imagen, descripción, efectos) en la UI.
 */

export class Epic {
  image: string;
  id: number;
  name: string;
  heroType: string;
  description: string;
  status: boolean;
  stock: number;
  effects: Effect[];
  cooldown: number;
  isAvailable: boolean;
  masterChance: number;

constructor(
    id: number = 0,
    image: string = '',
    heroType: string = '',
    description: string = '',
    name: string = '',
    status: boolean = true,
    stock: number = 0,
    effects: Effect[] = [],
    cooldown: number =0,
    isAvailable: boolean = true,
    masterChance: number = 0 
  ) {
    this.id = id;
    this.image = image;
    this.heroType = heroType;
    this.description = description;
    this.name = name;
    this.effects = effects;
    this.cooldown = cooldown;
    this.isAvailable = isAvailable;
    this.status = status;
    this.masterChance = masterChance;
    this.stock = stock;
  }
}
