import { Effect } from "./effect.model";

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
