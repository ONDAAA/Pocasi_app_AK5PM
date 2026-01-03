import { Component } from '@angular/core';
import { SearchPage } from '../pages/search/search.page';

@Component({
  selector: 'app-tab1',
  standalone: true,
  imports: [SearchPage],
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
})
export class Tab1Page {}
