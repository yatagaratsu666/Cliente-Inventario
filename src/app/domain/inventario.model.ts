import { Armor } from "./armor.model";
import { Item } from "./item.model";
import { Weapon } from "./weapon.model";
import { Epic } from "./epic.model";
import Hero from "./heroe.model";

export default class Inventario {
  weapons: Weapon[];
  armors: Armor[];
  items: Item[];
  epicAbility: Epic[];
  hero: Hero[];

  constructor(
    weapons: Weapon[] = [],
    armors: Armor[] = [],
    items: Item[] = [],
    epicAbility: Epic[] = [],
    hero: Hero[] = []
  ) {
    this.weapons = weapons;
    this.armors = armors;
    this.items = items;
    this.epicAbility = epicAbility;
    this.hero = hero;
  }
}
