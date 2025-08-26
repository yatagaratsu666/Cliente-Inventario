import { BattleLogger } from "./BattleLogger.model";
import { Player } from "./Player.model";
import { Team } from "./Team.model";

export class Battle {
  constructor(
    public id: string,
    public roomId: string,
    public teams: Team[],
    public turnOrder: string[],
    public currentTurnIndex: number,
    public state: "WAITING" | "IN_PROGRESS" | "FINISHED",
    public battleLogger: BattleLogger,
    public initialPowers: Map<string, number>,
    public winner: string | null,
    public isEnded: boolean
  ) {
  }
}
