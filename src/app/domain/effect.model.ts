/**
 * Enum que define los tipos de efectos posibles dentro del juego.
 * Cada tipo representa una acción o modificación que puede aplicarse
 * a un héroe, arma u otro elemento durante una batalla.
 */

export enum EffectType {
  DAMAGE = "DAMAGE", // Daño directo al enemigo
  HEAL = "HEAL", // Curación de puntos de vida
  BOOST_ATTACK = "BOOST_ATTACK", // Aumento temporal del ataque
  BOOST_DEFENSE = "BOOST_DEFENSE", // Aumento temporal de la defensa
  REVIVE = "REVIVE", // Revivir a un héroe caído
  DODGE = "DODGE", // Esquivar un ataque
  DEFENSE = "DEFENSE" // Aumento de la defensa
}

/**
 * Clase que representa un efecto aplicado dentro del juego.
 * Los efectos pueden modificar atributos o realizar acciones
 * durante un número limitado de turnos.
 */
export class Effect {
  effectType: EffectType;
  value: number;
  durationTurns: number;

  constructor(effectType: EffectType = EffectType.BOOST_DEFENSE, value: number = 0, durationTurns: number = 0) {
    this.effectType = effectType;
    this.value = value;
    this.durationTurns = durationTurns;
  }
}
