import { Effect } from "./effect.model";
import { HeroType } from "./item.model";

export enum ArmorType {
    HELMET = 'HELMET',
    CHEST = 'CHEST',
    GLOVERS = 'GLOVERS',
    BRACERS = 'BRACERS',
    BOOTS = 'BOOTS',
    PANTS = 'PANTS'
}

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
