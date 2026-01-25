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
  constructor(
    private appMode: AppModeService,
    private router: Router
  ) {}

  async ngOnInit() {
    const mode = await this.appMode.getMode();

    if (mode === 'guest' || mode === 'user') {
      await this.router.navigateByUrl('/tabs/tab1', { replaceUrl: true });
      return;
    }

    await this.router.navigateByUrl('/auth-gate', { replaceUrl: true });
  }
}
