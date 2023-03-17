import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import {
  BehaviorSubject,
  from,
  Observable,
  shareReplay,
  switchMap,
  take,
  tap,
} from 'rxjs';

import { ISettings } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private _settings$ = new BehaviorSubject<ISettings>({
    sort: 'hot',
    perPage: 10,
  });

  private _hasLoaded = false;

  private storage$ = from(this.ionicStorage.create()).pipe(shareReplay(1));

  public load$: Observable<ISettings> = this.storage$.pipe(
    switchMap((storage) => from(storage.get('settings'))),
    tap(() => (this._hasLoaded = true)),
    shareReplay(1)
  );

  public get settings$() {
    return this._settings$.asObservable();
  }

  constructor(private ionicStorage: Storage) {}

  public init() {
    this.load$.pipe(take(1)).subscribe((settings) => {
      if (settings) {
        this._settings$.next(settings);
      }
    });
  }

  public save(settings: ISettings) {
    this._settings$.next(settings);

    if (this._hasLoaded) {
      this.storage$.pipe(take(1)).subscribe((storage) => {
        storage.set('settings', settings);
      });
    }
  }
}
