/**
 * Enumeraciones base del sistema de combate
 *
 * Este archivo agrupa los enums esenciales para definir
 * los tipos, estados y acciones de los héroes dentro del juego.
 *.
 * - Cada enum se usa para controlar flujos lógicos y compatibilidad entre héroes, ítems y acciones.
 *
 */

export enum HeroType {
    TANK,
    WEAPONS_PAL,
    FIRE_MAGE,
    ICE_MAGE,
    POISON_ROGUE,
    SHAMAN,
    MEDIC
}

export enum HeroState {
    ALIVE,
    DEAD
}

export enum EffectType {
    DAMAGE,
    HEAL,
    BOOST_ATTACK,
    BOOST_DEFENSE,
    REVIVE,
    DODGE,
    DEFENSE
}

export enum ArmorType {
    HELMET,
    CHEST,
    GLOVERS,
    BRACERS,
    BOOTS,
    PANTS
}

export enum ActionType {
    ATTACK,
    DEFENSE,
    HEAL
}