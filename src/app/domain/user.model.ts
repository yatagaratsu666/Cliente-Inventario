import Inventario from "./inventario.model";
import Equipamiento from "./equipment.model";

export enum Roles {
  JUGADOR = "jugador",
  ADMINISTRADOR = "administrador",
}

export default class User {
  id: number;
  nombreUsuario: string;
  rol: Roles;
  contraseña: string;
  inventario: Inventario;
  equipados: Equipamiento;

  constructor(
    id: number = 0,
    userName: string = '',
    rol: Roles = Roles.JUGADOR,
    password: string = '',
    inventario: Inventario = new Inventario(),
    equipados: Equipamiento = new Equipamiento()
  ) {
    this.id = id;
    this.nombreUsuario = userName;
    this.rol = rol;
    this.contraseña = password;
    this.inventario = inventario;
    this.equipados = equipados;
  }
}
