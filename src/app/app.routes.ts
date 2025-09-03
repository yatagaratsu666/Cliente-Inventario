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

const routeConfig: Routes = [
  { path: '',  
    component: AppLandingComponent },
  {
    path: 'login',
    component: AppLoginComponent,
  },
  {
    path: 'items/create',
    component: AppRegisterItemComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'items/control',
    component: AppGestionItemComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'items/modify/:id',
    component: AppModifyItemComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'heroes/create',
    component: AppRegisterHeroeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'heroes/control',
    component: AppGestionHeroeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'heroes/modify/:id',
    component: AppModifyHeroeComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'weapons/create',
    component: AppRegisterWeaponComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'weapons/control',
    component: AppGestionWeaponComponent,
    canActivate: [AuthGuard]
  },
      {
    path: 'weapons/modify/:id',
    component: AppModifyWeaponComponent,
    canActivate: [AuthGuard]
  },
    {
    path: 'armors/create',
    component: AppRegisterArmorComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'armors/control',
    component: AppGestionArmorComponent,
    canActivate: [AuthGuard]
  },
      {
    path: 'armors/modify/:id',
    component: AppModifyArmorComponent,
    canActivate: [AuthGuard]
  },
      {
    path: 'epics/create',
    component: AppRegisterEpicaComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'epics/control',
    component: AppGestionEpicaComponent,
    canActivate: [AuthGuard]
  },
      {
    path: 'epics/modify/:id',
    component: AppModifyEpicaComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'gestion',
    component: AppGestionComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'battles',
    component: RoomsListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'rooms/:id',
    component: RoomLobbyComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'battle/:id',
    component: BattleComponent,
    canActivate: [AuthGuard]
  }
];

export default routeConfig;
