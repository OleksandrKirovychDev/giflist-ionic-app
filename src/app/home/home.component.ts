import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { BehaviorSubject, combineLatest, map, startWith } from 'rxjs';

import { GifListComponent } from './ui/gif-list.component';
import { RedditService } from '../shared/data-access/reddit.service';
import { IGif } from '../shared/interfaces';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SearchBarComponent } from './ui/search-bar.component';
import { SettingsComponent } from '../settings/settings.component';

const routes: Routes = [];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    GifListComponent,
    ReactiveFormsModule,
    SearchBarComponent,
    SettingsComponent,
  ],
  providers: [],
  template: `
    <ng-container *ngIf="vm$ | async as vm">
      <ion-header>
        <ion-toolbar>
          <ion-title> Home </ion-title>
        </ion-toolbar>
        <ion-toolbar>
          <app-search-bar [searchForm]="subredditFormControl"></app-search-bar>
          <ion-buttons slot="end">
            <ion-button
              id="settings-button"
              (click)="settingsModalIsOpen$.next(true)"
            >
              <ion-icon slot="icon-only" name="settings"></ion-icon>
            </ion-button>
          </ion-buttons>
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
          threshold="20px"
          (ionInfinite)="loadMore($event, vm.gifs)"
        >
          <ion-infinite-scroll-content
            loadingSpinner="bubbles"
            loadingText="Loading gifs..."
          >
          </ion-infinite-scroll-content>
        </ion-infinite-scroll>
        <ion-popover
          trigger="settings-button"
          [isOpen]="vm.settingsModalIsOpen"
          (ionPopoverDidDismiss)="settingsModalIsOpen$.next(false)"
        >
          <ng-template>
            <app-settings></app-settings>
          </ng-template>
        </ion-popover>
      </ion-content>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  public subredditFormControl = new FormControl('gifs');

  private _currentlyLoadingGifs$ = new BehaviorSubject<string[]>([]);
  private _loadedGifs$ = new BehaviorSubject<string[]>([]);
  public settingsModalIsOpen$ = new BehaviorSubject<boolean>(false);

  private gifs$ = combineLatest([
    this.redditService.getGifs(this.subredditFormControl),
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

  public vm$ = combineLatest([
    this.gifs$.pipe(startWith([])),
    this.settingsModalIsOpen$,
  ]).pipe(
    map(([gifs, settingsModalIsOpen]) => ({
      gifs,
      settingsModalIsOpen,
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
