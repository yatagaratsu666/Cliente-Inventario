import { Effect } from "./effect.model";

export class Item {
  id: number;
  image: string;
  heroType: string;
  description: string;
  name: string;
  status: boolean;
  effects: Effect[];
  dropRate: number;

  constructor(
    id: number = 0,
    image: string = '',
    heroType: string = '',
    description: string = '',
    name: string = '',
    status: boolean = true,
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
  }
}
