export class Effect {
  effectType: string;
  value: number;
  durationTurns: number;
  

  constructor(effectType: string = '', value: number = 0, durationTurns: number = 0) {
    this.effectType = effectType;
    this.value = value;
    this.durationTurns = durationTurns;
  }
}
