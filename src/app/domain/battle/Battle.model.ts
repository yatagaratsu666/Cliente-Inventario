import { BattleLogger } from "./BattleLogger.model";
import { Player } from "./Player.model";
import { Team } from "./Team.model";

/**
 * Battle
 *
 * Modelo que representa una batalla dentro del juego.
 *
 * Contiene toda la información esencial del combate en curso,
 * incluyendo quién participa, en qué estado está, y el registro
 * de todo lo que ha pasado en ella.
 *
 * Campos principales:
 * - `id`: Identificador único de la batalla.
 * - `roomId`: ID de la sala de donde proviene esta batalla.
 * - `teams`: Lista de equipos que están participando.
 * - `turnOrder`: Orden de los jugadores según el turno.
 * - `currentTurnIndex`: Índice actual dentro de `turnOrder` que indica quién juega.
 * - `state`: Estado actual de la batalla.
 * - `battleLogger`: Instancia de `BattleLogger` que guarda todos los logs/acciones ocurridas.
 * - `initialPowers`: Mapa con los poderes iniciales de cada jugador.
 * - `winner`: Nombre/ID del equipo o jugador ganador, o `null` si aún no hay resultado.
 * - `isEnded`: Flag booleano que indica si la batalla ya terminó (true) o sigue activa (false).
 */
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
