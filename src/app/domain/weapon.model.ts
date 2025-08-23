import { Effect } from './effect.model';
import { HeroType } from './item.model';

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
