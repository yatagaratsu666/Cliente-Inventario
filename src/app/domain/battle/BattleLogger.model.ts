import { BattleLog } from "./BattleLog.model";

/**
 * BattleLogger
 *
 * Clase encargada de almacenar y gestionar los registros (logs) de una batalla.
 *
 * - Mantiene una lista interna de `BattleLog` con el historial de eventos.
 * - Permite agregar nuevos registros conforme avanza la pelea.
 * - Se puede consultar todo el historial cuando sea necesario.
 * - Soporta reiniciar el log limpiando todos los registros previos.
 *
 * Uso común:
 * - Guardar jugadas, ataques, curaciones y efectos aplicados durante un combate.
 * - Mostrar el historial de acciones al usuario en tiempo real o al final de la batalla.
 * - Depurar mecánicas de combate viendo exactamente qué ocurrió en cada turno.
 */


export class BattleLogger {
  private logs: BattleLog[] = [];

  constructor(initialLogs: BattleLog[] = []) {
    this.logs = initialLogs;
  }

  /**
 * Agrega una nueva entrada al registro de batalla.
 * @param entry Instancia de BattleLog que describe un evento ocurrido en combate.
 */
  addLog(entry: BattleLog) {
    this.logs.push(entry);
  }

  /**
   * Obtiene el historial completo de la batalla.
   * @returns Array con todas las entradas (BattleLog[]) registradas hasta el momento.
   */
  getLogs(): BattleLog[] {
    return this.logs;
  }
  /**
  * Limpia todos los registros de batalla.
  * Útil al iniciar una nueva pelea o reiniciar el estado del logger.
  */
  clear() {
    this.logs = [];
  }
}
