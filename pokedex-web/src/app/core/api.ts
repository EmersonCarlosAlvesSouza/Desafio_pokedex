// src/app/core/api.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

// --------- Tipos ----------
export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  'special-attack': number;
  'special-defense': number;
  speed: number;
}

export interface PokemonLite {
  id: number;
  name: string;
  sprite: string | null;
  types: string[];
  generation: number;

  // Campos retornados pelo seu backend (opcionais para tolerar ausência):
  stats?: PokemonStats;
  favorito?: boolean;
  em_grupo?: boolean;
}

export interface Page<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
// --------------------------

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  ping() {
    return this.http.get<{ status: string; message: string }>(`${this.base}/api/ping`);
  }

  getPokemonList(params: { name?: string; generation?: number; page?: number; page_size?: number }) {
    const query = new URLSearchParams();
    if (params.name) query.set('name', params.name);
    if (params.generation) query.set('generation', String(params.generation));
    if (params.page) query.set('page', String(params.page));
    if (params.page_size) query.set('page_size', String(params.page_size));
    const qs = query.toString();

    return this.http.get<Page<PokemonLite>>(`${this.base}/api/pokemon${qs ? `?${qs}` : ''}`);
  }

  toggleFavorite(pid: number) {
    return this.http.post<{ favorite: boolean }>(`${this.base}/api/pokemon/${pid}/favorite`, {});
  }

  teamAdd(pid: number) {
    return this.http.post<{ in_team: boolean }>(`${this.base}/api/pokemon/${pid}/team/add`, {});
  }

  teamRemove(pid: number) {
    return this.http.post<{ in_team: boolean }>(`${this.base}/api/pokemon/${pid}/team/remove`, {});
  }

  // Listas do usuário
  getFavorites() {
    return this.http.get<PokemonLite[]>(`${this.base}/api/favorites`);
  }

  getTeam() {
    return this.http.get<PokemonLite[]>(`${this.base}/api/team`);
  }
}
