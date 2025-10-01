import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.loading = true; this.error = '';
    this.auth.login(this.username, this.password).subscribe({
      next: (t) => { this.auth.saveTokens(t); this.router.navigateByUrl('/'); },
      error: () => { this.error = 'Credenciais inválidas'; this.loading = false; }
    });
  }
}
