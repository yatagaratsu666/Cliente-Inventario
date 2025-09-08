import { Player } from "./Player.model";

/**
 * Team
 *
 * Modelo de datos que representa un equipo de jugadores dentro del juego.
 *
 * - Agrupa una lista de jugadores (Player[]) bajo un identificador único (id).
 * - Permite reconstruirse a partir de datos JSON (fromJSON).
 * - Ofrece utilidades para buscar jugadores dentro del equipo por su username.
 *
 * Uso común:
 * - Manejo de equipos en partidas (por ejemplo, equipos 1v1, 2v2, 3v3, etc.).
 * - Validar si un jugador pertenece a un equipo.
 * - Serializar y deserializar datos de equipos recibidos del backend.
 */

export class Team {
  constructor(
    public id: string,
    public players: Player[]
  ) {}

    /**
   * Crea una instancia de Team a partir de datos JSON.
   * Convierte cada objeto del array `players` en una instancia de Player.
   *
   * @param data Datos traidos del backend.
   * @returns Una nueva instancia de Team.
   */
  static fromJSON(data: any): Team {
    const players = data.players.map((p: any) => Player.fromJSON(p));
    return new Team(data.id, players);
  }
    /**
   * Busca un jugador dentro del equipo por su nombre de usuario.
   * 
   * @param playerUsername Nombre de usuario del jugador a buscar.
   * @returns El objeto Player si se encuentra, o undefined si no existe.
   */
  findPlayer(playerUsername: string): Player | undefined {
    return this.players.find(player => player.username === playerUsername);
  }
}
