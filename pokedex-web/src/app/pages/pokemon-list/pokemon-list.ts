import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, PokemonLite, Page } from '../../core/api';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pokemon-list.html',
  styleUrl: './pokemon-list.scss'
})
export class PokemonListComponent implements OnInit {
  name = '';
  generation: number | null = null;
  page = 1;
  pageSize = 12;

  loading = false;
  data?: Page<PokemonLite>;

  constructor(private api: ApiService) { }

  ngOnInit(): void { this.load(); }

  load() {
    this.loading = true;
    this.api.getPokemonList({
      name: this.name || undefined,
      generation: this.generation ?? undefined,
      page: this.page,
      page_size: this.pageSize,
    }).subscribe(res => { this.data = res; this.loading = false; });
  }
  // Normaliza um valor de 0–100 para a barra
  pct(v?: number) {
    if (v == null) return 0;
    const n = Math.round(v);
    return Math.max(0, Math.min(100, n));
  }
  search() { this.page = 1; this.load(); }
  next() { if (this.data?.next) { this.page++; this.load(); } }
  prev() { if (this.data?.previous && this.page > 1) { this.page--; this.load(); } }
  busy = new Set<number>();

  fav(p: PokemonLite) {
    this.busy.add(p.id);
    this.api.toggleFavorite(p.id).subscribe({
      next: (res) => {
        alert(res.favorite ? 'Adicionado aos favoritos' : 'Removido dos favoritos');
        this.busy.delete(p.id);
      },
      error: () => { alert('Falha ao favoritar'); this.busy.delete(p.id); }
    });
  }

  team(p: PokemonLite) {
    this.busy.add(p.id);
    // tenta alternar: se já estiver na equipe o backend remove; se não, adiciona
    // (se preferir dois botões, chame teamAdd/teamRemove separadamente)
    this.api.teamAdd(p.id).subscribe({
      next: (res) => {
        alert(res.in_team ? 'Adicionado à equipe' : 'Equipe atualizada');
        this.busy.delete(p.id);
      },
      error: (_) => {
        // se deu erro ao adicionar (ex.: limite 6), tenta remover (toggle simples)
        this.api.teamRemove(p.id).subscribe({
          next: (r2) => { alert(r2.in_team ? 'Permanece na equipe' : 'Removido da equipe'); this.busy.delete(p.id); },
          error: () => { alert('Falha ao atualizar equipe'); this.busy.delete(p.id); }
        });
      }
    });
  }
}
