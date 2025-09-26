import Inventario from "./inventario.model";
import Equipamiento from "./equipment.model";

export enum Roles {
  JUGADOR = "jugador",
  ADMINISTRADOR = "administrador",
}

export default class User {
  nombreUsuario: string;
  avatar: string;
  rol: Roles;
  creditos: number;
  inventario: Inventario;
  equipados: Equipamiento;
  exp: number;

  constructor(
    nombreUsuario: string = '',
    avatar: string = '',
    rol: Roles = Roles.JUGADOR,
    creditos: number = 0,
    inventario: Inventario = new Inventario(),
    equipados: Equipamiento = new Equipamiento(),
    exp: number = 0
  ) {
    this.nombreUsuario = nombreUsuario;
    this.avatar = avatar;
    this.rol = rol;
    this.creditos= creditos;
    this.inventario = inventario;
    this.equipados = equipados;
    this.exp = exp
  }
}
