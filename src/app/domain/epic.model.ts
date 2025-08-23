import { Effect } from "./effect.model";

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
