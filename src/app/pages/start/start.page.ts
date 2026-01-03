import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AppModeService } from '../../services/app-mode.service';

@Component({
  selector: 'app-start',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './start.page.html',
  styleUrls: ['./start.page.scss'],
})
export class StartPage implements OnInit {
  constructor(private appMode: AppModeService, private router: Router) {}

  ngOnInit() {
    // fallback kdyby Preferences spadly nebo něco viselo
    const fallback = setTimeout(() => {
      this.router.navigateByUrl('/auth-gate', { replaceUrl: true });
    }, 1200);

    this.appMode
      .getMode()
      .then((mode) => {
        clearTimeout(fallback);

        if (mode === 'guest' || mode === 'user') {
          this.router.navigateByUrl('/tabs', { replaceUrl: true });
        } else {
          this.router.navigateByUrl('/auth-gate', { replaceUrl: true });
        }
      })
      .catch(() => {
        clearTimeout(fallback);
        this.router.navigateByUrl('/auth-gate', { replaceUrl: true });
      });
  }
}
