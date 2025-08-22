export enum EffectType {
  DAMAGE = "DAMAGE",
  HEAL = "HEAL",
  BOOST_ATTACK = "BOOST_ATTACK",
  BOOST_DEFENSE = "BOOST_DEFENSE",
  REVIVE = "REVIVE",
  DODGE = "DODGE",
  DEFENSE = "DEFENSE"
}

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
