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
  contraseña: string;
  inventario: Inventario;
  equipados: Equipamiento;

  constructor(
    id: string = '',
    nombreUsuario: string = '',
    rol: Roles = Roles.JUGADOR,
    contraseña: string = '',
    inventario: Inventario = new Inventario(),
    equipados: Equipamiento = new Equipamiento()
  ) {
    this.id = id;
    this.nombreUsuario = nombreUsuario;
    this.rol = rol;
    this.contraseña = contraseña;
    this.inventario = inventario;
    this.equipados = equipados;
  }
}
