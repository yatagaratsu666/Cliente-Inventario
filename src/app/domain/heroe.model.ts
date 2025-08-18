import { Effect } from "./effect.model";

export default class Hero {
    image: string;
    id: number;
    name: string;
    heroType: string;
    description: string;
    level: number;
    power: number;
    health: number;
    defense: number;
    status: boolean;
    attack: number;
    attackBoost: { min: number; max: number };
    damage: { min: number; max: number };
    specialActions: {
        name: string;
        actionType: string;
        powerCost: number;
        effects: Effect[];
        cooldown: number;
        isAvailable: boolean;
    }[];

    constructor(
        image: string = '',
        name: string = '',
        heroType: string = '',
        description: string = '',
        level: number = 1,
        power: number = 0,
        health: number = 0,
        defense: number = 0,
        status: boolean = true,
        attack: number = 0,
        attackBoost: { min: number; max: number } = { min: 0, max: 0 },
        damage: { min: number; max: number } = { min: 0, max: 0 },
        specialActions: {
            name: string;
            actionType: string;
            powerCost: number;
            effects: Effect[];
            cooldown: number;
            isAvailable: boolean;
        }[] = [],
        id: number = 0
    ) {
        this.image = image;
        this.name = name;
        this.heroType = heroType;
        this.description = description;
        this.level = level;
        this.power = power;
        this.health = health;
        this.defense = defense;
        this.status = status;
        this.attack = attack;
        this.attackBoost = attackBoost;
        this.damage = damage;
        this.specialActions = specialActions;
        this.id = id;
    }
}
