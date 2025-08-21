import { Effect } from './effect.model';

export class Weapon {
  image: string;
  id: number;
  name: string;
  description: string;
  status: boolean;
  effects: Effect[];
  dropRate: number;

  constructor(
    id: number = 0,
    image: string = '',
    description: string = '',
    name: string = '',
    status: boolean = true,
    effects: Effect[] = [],
    dropRate: number = 0
  ) {
    this.id = id;
    this.image = image;
    this.description = description;
    this.name = name;
    this.effects = effects;
    this.dropRate = dropRate;
    this.status = status;
  }
}
