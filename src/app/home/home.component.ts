import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { BehaviorSubject, combineLatest, map, startWith } from 'rxjs';

import { GifListComponent } from './ui/gif-list.component';
import { RedditService } from '../shared/data-access/reddit.service';
import { IGif } from '../shared/interfaces';

const routes: Routes = [];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule, GifListComponent],
  providers: [],
  template: `
    <ng-container *ngIf="vm$ | async as vm">
      <ion-header>
        <ion-toolbar>
          <ion-title> Home </ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <app-gif-list
          [gifs]="vm.gifs"
          (gifLoadStart)="setLoading($event)"
          (gifLoadComplete)="setLoadingComplete($event)"
        >
        </app-gif-list>
        <ion-infinite-scroll
          threshold="100px"
          (ionInfinite)="loadMore($event, vm.gifs)"
        >
          <ion-infinite-scroll-content
            loadingSpinner="bubbles"
            loadingText="Loading gifs..."
          >
          </ion-infinite-scroll-content>
        </ion-infinite-scroll>
      </ion-content>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private _currentlyLoadingGifs$ = new BehaviorSubject<string[]>([]);
  private _loadedGifs$ = new BehaviorSubject<string[]>([]);

  private gifs$ = combineLatest([
    this.redditService.getGifs(),
    this._currentlyLoadingGifs$,
    this._loadedGifs$,
  ]).pipe(
    map(([gifs, currentlyLoadingGifs, loadedGifs]) =>
      gifs.map((gif) => ({
        ...gif,
        loading: currentlyLoadingGifs.includes(gif.permalink),
        dataLoaded: loadedGifs.includes(gif.permalink),
      }))
    )
  );

  public vm$ = combineLatest([this.gifs$.pipe(startWith([]))]).pipe(
    map(([gifs]) => ({
      gifs,
    }))
  );

  constructor(private redditService: RedditService) {}

  public setLoading(permalink: string) {
    this._currentlyLoadingGifs$.next([
      ...this._currentlyLoadingGifs$.value,
      permalink,
    ]);
  }

  public setLoadingComplete(permalink: string) {
    this._loadedGifs$.next([...this._loadedGifs$.value, permalink]);

    this._currentlyLoadingGifs$.next([
      ...this._currentlyLoadingGifs$.value.filter(
        (permalink) => !this._loadedGifs$.value.includes(permalink)
      ),
    ]);
  }

  public loadMore(e: Event, currentGifs: IGif[]) {
    this.redditService.nextPage(e, currentGifs[currentGifs.length - 1].name);
  }
}

export const HOME_ROUTES: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
];
