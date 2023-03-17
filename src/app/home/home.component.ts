import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { provideRouter, RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { RedditService } from '../shared/data-access/reddit.service';
import { GifListComponent } from './ui/gif-list.component';

const routes: Routes = [];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule, GifListComponent],
  providers: [],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title> Home </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <app-gif-list *ngIf="gifs$ | async as gifs" [gifs]="gifs"> </app-gif-list>
    </ion-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  public gifs$ = this.redditService.getGifs('gifs');

  constructor(private redditService: RedditService) {}
}

export const HOME_ROUTES: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
];
