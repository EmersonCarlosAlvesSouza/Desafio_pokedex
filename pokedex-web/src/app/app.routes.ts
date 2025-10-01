import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { PokemonListComponent } from './pages/pokemon-list/pokemon-list';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'pokemon', component: PokemonListComponent },  // ← novo
];
