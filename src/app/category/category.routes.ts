import { Routes } from '@angular/router';

export const categoriesPath = 'categories';

const categoryRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./page/category-list/category-list.component'),
    title: 'Categories'
  }
];

export default categoryRoutes;
