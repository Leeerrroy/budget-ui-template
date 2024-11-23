import { Routes } from '@angular/router';
import { categoriesPath } from '../category/category.routes';
import { expensesPath } from '../expense/expense.routes';
import {authGuard} from "./guard/auth.guard";

export const loginPath = 'login';
export const defaultPath = categoriesPath; // TODO: switch to ex

export const appRoutes = [
  {
    path: loginPath,
    loadComponent: () => import('./component/login/login.component'),
  },
  {
    path: categoriesPath,
    loadChildren: () => import('../category/category.routes'),
    canActivate: [authGuard],
  },
  {
    path: expensesPath,
    loadChildren: () => import('../expense/expense.routes'),
    canActivate: [authGuard],
  },
];
export default appRoutes;
