import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { isBrowser } from './platform';

type LoginResp = { access: string; refresh: string };
type StorageLike = { getItem(k:string): string|null; setItem(k:string,v:string): void; removeItem(k:string): void };

const mem = new Map<string,string>();
const memoryStorage: StorageLike = {
  getItem: k => mem.get(k) ?? null,
  setItem: (k,v) => mem.set(k,v),
  removeItem: k => mem.delete(k),
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiBaseUrl;
  private ACCESS_KEY = 'access';
  private REFRESH_KEY = 'refresh';
  private storage: StorageLike = isBrowser() ? localStorage : memoryStorage;

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    return this.http.post<LoginResp>(`${this.base}/auth/login`, { username, password });
  }

  saveTokens(t: LoginResp) {
    this.storage.setItem(this.ACCESS_KEY, t.access);
    this.storage.setItem(this.REFRESH_KEY, t.refresh);
  }

  get access()  { return this.storage.getItem(this.ACCESS_KEY) ?? ''; }
  get refresh() { return this.storage.getItem(this.REFRESH_KEY) ?? ''; }

  logout() {
    this.storage.removeItem(this.ACCESS_KEY);
    this.storage.removeItem(this.REFRESH_KEY);
  }
  refreshAccess() {
  return this.http.post<{ access: string }>(
    `${this.base}/auth/refresh`,
    { refresh: this.refresh }
  );
}

setAccess(token: string) {
  // atualiza somente o access, mantém o refresh
  this.storage.setItem(this.ACCESS_KEY, token);
}

}
