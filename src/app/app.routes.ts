import { Routes } from '@angular/router';

import { AppRegisterItemComponent } from './app-item/app-register-item/app-register-item.component';
import { AppItemComponent } from './app-item/app-item.component';
import { AppGestionItemComponent } from './app-item/app-gestion-item/app-gestion-item.component';
import { AppModifyItemComponent } from './app-item/app-modify-item/app-modify-item.component';
import { AppHeroeComponent } from './app-heroe/app-heroe.component';
import { AppRegisterHeroeComponent } from './app-heroe/app-register-heroe/app-register-heroe.component';
import { AppGestionHeroeComponent } from './app-heroe/app-gestion-heroe/app-gestion-heroe.component';
import { AppModifyHeroeComponent } from './app-heroe/app-modify-heroe/app-modify-heroe.component';
import { AppGestionComponent } from './app-gestion/app-gestion.component';
import { AppLoginComponent } from './app-login/app-login.component';
import { AuthGuard } from './guards/auth.guard';
import { AppRegisterWeaponComponent } from './app-weapon/app-register-weapon/app-register-weapon.component';
import { AppGestionWeaponComponent } from './app-weapon/app-gestion-weapon/app-gestion-weapon.component';
import { AppModifyWeaponComponent } from './app-weapon/app-modify-weapon/app-modify-weapon.component';
import { AppRegisterArmorComponent } from './app-armor/app-register-armor/app-register-armor.component';
import { AppGestionArmorComponent } from './app-armor/app-gestion-armor/app-gestion-armor.component';
import { AppModifyArmorComponent } from './app-armor/app-modify-armor/app-modify-armor.component';
import { AppRegisterEpicaComponent } from './app-epica/app-register-epica/app-register-epica.component';
import { AppGestionEpicaComponent } from './app-epica/app-gestion-epica/app-gestion-epica.component';
import { AppModifyEpicaComponent } from './app-epica/app-modify-epica/app-modify-epica.component';
import { Component } from '@angular/core';
import { RoomsListComponent } from './rooms-list/rooms-list.component';
import { RoomLobbyComponent } from './rooms-lobby/rooms-lobby.component';
import { BattleComponent } from './battle/battle.component';
import { AppLandingComponent } from './app-landing/app-landing.component';
import { AppMenuComponent } from './app-menu/app-menu.component';
import { CuentaComponent } from './app-cuenta/cuenta-component';
import { AppInventarioComponent } from './app-inventario/app-inventario.component';

/**
 * Definición de rutas principales de la app.
 * Cada objeto en el arreglo representa una ruta del enrutador de Angular.
 * - path: la URL que activa la ruta.
 * - component: el componente que se muestra al navegar a la ruta.
 * - canActivate: guards que restringen el acceso a la ruta.
 */

const routeConfig: Routes = [
  // ruta para Landing page 
  { path: '',  
    component: AppLandingComponent },
  // ruta para Inicio de sesión
  {
    path: 'login',
    component: AppLoginComponent,
  },
  // ruta para crear un item
  {
    path: 'items/create',
    component: AppRegisterItemComponent,
    canActivate: [AuthGuard]
  },
  //ruta para el menu principal
  {
    path: 'menu',
    component: AppMenuComponent,
    canActivate: [AuthGuard]
  },
  // ruta para ver la lista de items
  {
    path: 'items/control',
    component: AppGestionItemComponent,
    canActivate: [AuthGuard]
  },
  // ruta para modificar un item
  {
    path: 'items/modify/:id',
    component: AppModifyItemComponent,
    canActivate: [AuthGuard]
  },
  //ruta para crear un heroe
  {
    path: 'heroes/create',
    component: AppRegisterHeroeComponent,
    canActivate: [AuthGuard]
  },
  // ruta para ver la lista de heroes
  {
    path: 'heroes/control',
    component: AppGestionHeroeComponent,
    canActivate: [AuthGuard]
  },
  // ruta para modificar un heroe
  {
    path: 'heroes/modify/:id',
    component: AppModifyHeroeComponent,
    canActivate: [AuthGuard]
  },
  //ruta para crear un arma
  {
    path: 'weapons/create',
    component: AppRegisterWeaponComponent,
    canActivate: [AuthGuard]
  },
  // ruta para ver la lista de armas
  {
    path: 'weapons/control',
    component: AppGestionWeaponComponent,
    canActivate: [AuthGuard]
  },
  // ruta para modificar un arma
      {
    path: 'weapons/modify/:id',
    component: AppModifyWeaponComponent,
    canActivate: [AuthGuard]
  },
  //ruta para crear una armadura
    {
    path: 'armors/create',
    component: AppRegisterArmorComponent,
    canActivate: [AuthGuard]
  },
  // ruta para ver la lista de armaduras
  {
    path: 'armors/control',
    component: AppGestionArmorComponent,
    canActivate: [AuthGuard]
  },
  // ruta para modificar una armadura
      {
    path: 'armors/modify/:id',
    component: AppModifyArmorComponent,
    canActivate: [AuthGuard]
  },
  //ruta para crear una épica
      {
    path: 'epics/create',
    component: AppRegisterEpicaComponent,
    canActivate: [AuthGuard]
  },
  // ruta para ver la lista de épicas
  {
    path: 'epics/control',
    component: AppGestionEpicaComponent,
    canActivate: [AuthGuard]
  },
  // ruta para modificar una épica
      {
    path: 'epics/modify/:id',
    component: AppModifyEpicaComponent,
    canActivate: [AuthGuard]
  },
  // ruta para el menu de gestión general
  {
    path: 'gestion',
    component: AppGestionComponent,
    canActivate: [AuthGuard]
  },
  // ruta para la lista de salas de batalla
  {
    path: 'battles',
    component: RoomsListComponent,
    canActivate: [AuthGuard]
  },
  //ruta para la sala de batalla
  {
    path: 'rooms/:id',
    component: RoomLobbyComponent,
    canActivate: [AuthGuard]
  },
  //ruta para la batalla actual
  {
    path: 'battle/:id',
    component: BattleComponent,
    canActivate: [AuthGuard]
  },
  //ruta para la cuenta del jugador
  {
    path: 'cuenta',
    component: CuentaComponent,
    canActivate: [AuthGuard]
  },
  //ruta para el inventario del jugador
  {
    path: 'inventory',
    component: AppInventarioComponent,
    canActivate: [AuthGuard]
  }
];

export default routeConfig;
