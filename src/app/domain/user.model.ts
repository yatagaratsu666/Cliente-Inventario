import Inventario from "./inventario.model";
import Equipamiento from "./equipment.model";

export enum Roles {
  JUGADOR = "jugador",
  ADMINISTRADOR = "administrador",
}

export default class User {
  id: string;
  nombreUsuario: string;
  rol: Roles;
  creditos: number;
  inventario: Inventario;
  equipados: Equipamiento;

  constructor(
    id: string = '',
    nombreUsuario: string = '',
    rol: Roles = Roles.JUGADOR,
    creditos: number = 0,
    inventario: Inventario = new Inventario(),
    equipados: Equipamiento = new Equipamiento()
  ) {
    this.id = id;
    this.nombreUsuario = nombreUsuario;
    this.rol = rol;
    this.creditos= creditos;
    this.inventario = inventario;
    this.equipados = equipados;
  }
}
