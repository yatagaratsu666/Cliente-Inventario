import { HeroStats } from "./HeroStats.model";

/**
 * Player
 *
 * Modelo de datos que representa a un jugador dentro del juego.
 *
 * - Contiene la información principal del jugador, como su nombre de usuario, nivel del héroe,
 *   estado de preparación y estadísticas del héroe.
 * - Se utiliza para identificar y manejar a cada jugador en partidas, equipos y lobbies.
 *
 * Uso común:
 * - Crear o reconstruir jugadores a partir de datos JSON recibidos del backend.
 * - Gestionar equipos, lobbies y salas de espera en partidas multijugador.
 * - Mostrar información del jugador en la UI (nombre, nivel, stats, estado).
 */
export class Player {
  username: string;
  heroLevel: number;
  ready: boolean;
  heroStats: HeroStats;

  constructor(username: string, heroLevel: number, ready: boolean, heroStats: HeroStats) {
    this.username = username;
    this.heroLevel = heroLevel;
    this.ready = ready;
    this.heroStats = heroStats;
  }

  /**
   * Crea una nueva instancia de Player a partir de datos JSON.
   * Se asegura de convertir heroStats usando HeroStats.fromJSON para mantener la estructura correcta.
   *
   * @param data Objeto JSON con las propiedades necesarias para construir un Player.
   * @returns Una nueva instancia de Player.
   */
  static fromJSON(data: any): Player {
    return new Player(
      data.username,
      data.heroLevel,
      data.ready,
      HeroStats.fromJSON(data.heroStats)
    );
  }
}
