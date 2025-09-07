/**
 * BattleLog
 *
 * Interfaz que define la estructura de un registro (log) de batalla.
 *
 * Cada entrada representa un evento que ocurrió durante un combate,
 * guardando información clave como:
 *
 * - `timestamp`: Momento exacto en el que ocurrió el evento.
 * - `attacker`: Nombre o identificador del jugador/personaje que realizó la acción.
 * - `target`: Nombre o identificador del jugador/personaje que recibió la acción.
 * - `value`: Valor numérico asociado al evento (ej: daño, curación, defensa aplicada).
 * - `effect`: Efecto especial aplicado, si existe (ej: “BURN”, “HEAL”, “STUN”), o `null` si no hubo efecto.
 * - `extra`: (Opcional) Información adicional para eventos complejos (críticos, buffs, debuffs, etc.).
 *
 */

export interface BattleLog {
  timestamp: number;
  attacker: string;
  target: string;
  value: number;
  effect: string | null;
  extra?: any;
}
