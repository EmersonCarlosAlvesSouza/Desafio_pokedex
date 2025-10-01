// src/app/core/jwt-interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth';
import {
  catchError, finalize, from, lastValueFrom, map, of, switchMap, throwError
} from 'rxjs';

// evita múltiplos refresh em paralelo
let refreshInFlight: Promise<string | null> | null = null;

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  // SSR: não mexe
  if (!isPlatformBrowser(platformId)) return next(req);

  // endpoints públicos: não anexar Authorization
  const url = req.url;
  const isPublic =
    url.includes('/auth/login') ||
    url.includes('/auth/refresh') ||
    url.includes('/api/ping');

  const auth = inject(AuthService);
  const token = auth.access;

  const authReq = (!isPublic && token)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      const shouldTryRefresh =
        err.status === 401 &&
        !isPublic &&
        !!auth.refresh;

      if (!shouldTryRefresh) {
        return throwError(() => err);
      }

      // inicia (ou reaproveita) o refresh em andamento
      if (!refreshInFlight) {
        refreshInFlight = lastValueFrom(
          auth.refreshAccess().pipe(
            map((res) => {
              auth.setAccess(res.access);       // salva novo access
              return res.access;
            }),
            catchError(() => {
              auth.logout();                    // refresh inválido
              return of(null);
            }),
            finalize(() => { refreshInFlight = null; })
          )
        );
      }

      // aguarda o refresh e refaz a requisição com o novo token
      return from(refreshInFlight).pipe(
        switchMap((newAccess) => {
          if (!newAccess) return throwError(() => err); // refresh falhou
          const retryReq = req.clone({
            setHeaders: { Authorization: `Bearer ${newAccess}` }
          });
          return next(retryReq);
        })
      );
    })
  );
};
