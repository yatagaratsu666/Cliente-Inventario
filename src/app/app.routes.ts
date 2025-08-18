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

const routeConfig: Routes = [
  {
    path: 'login',
    component: AppLoginComponent,
  },
  {
    path: 'items',
    component: AppItemComponent,
    canActivate: [AuthGuard]
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
    path: 'heroes',
    component: AppHeroeComponent,
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
    path: 'gestion',
    component: AppGestionComponent,
    canActivate: [AuthGuard]
  }
];

export default routeConfig;
