import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { Browser } from '@capacitor/browser';
import { IonicModule } from '@ionic/angular';

import { IGif } from '../../shared/interfaces/gif.interface';

@Component({
  selector: 'app-gif-list',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-list lines="none">
      <div class="gif" *ngFor="let gif of gifs; trackBy: trackByFn">
        <ion-item button [detail]="false" (click)="playVideo($event, gif)">
          <ion-spinner *ngIf="gif.loading" color="light"></ion-spinner>
          <div
            [style.background]="
              'url(' + gif.thumbnail + ') 50% 50% / cover no-repeat'
            "
            [ngStyle]="
              !gif.dataLoaded
                ? {
                    filter: 'blur(3px) brightness(0.6)',
                    transform: 'scale(1.1)'
                  }
                : {}
            "
            class="preload-background"
          >
            <video
              playsInline
              poster="none"
              preload="none"
              [loop]="true"
              [muted]="true"
              [src]="gif.src"
            ></video>
          </div>
          <ion-label>{{ gif.title }}</ion-label>
        </ion-item>
        <ion-list-header>
          <ion-label> {{ gif.title }} </ion-label>
          <ion-button (click)="showComments(gif)">
            <ion-icon name="chatbubbles"></ion-icon> {{ gif.comments }}
          </ion-button>
        </ion-list-header>
      </div>
    </ion-list>
  `,
  styles: [
    `
      ion-list {
        padding: 0;
      }

      ion-label {
        margin: 0;
        padding: 10px 0;
        overflow: auto;
      }
      .gif ion-item {
        --inner-padding-end: 0;
        --padding-start: 0;
        position: relative;
      }

      .gif ion-spinner {
        margin: auto;
        position: absolute;
        left: 0px;
        right: 0px;
        z-index: 1;
        background-color: var(--ion-color-dark);
        border: 10px solid var(--ion-color-dark);
        border-radius: 5px;
        padding: 20px;
      }

      .comments {
        display: block;
        width: 100%;
        margin-top: 5px;
        text-align: right;
        color: var(--ion-color-medium);
      }

      ion-list-header {
        align-items: center;
        background-color: var(--ion-color-light);
        border-bottom: 10px solid var(--ion-color-medium);
      }

      ion-list-header ion-button {
        margin: 0;
      }

      .preload-background {
        width: 100%;
        height: auto;
      }

      video {
        width: 100%;
        height: auto;
        margin: auto;
        background: transparent;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GifListComponent {
  @Input() gifs!: IGif[];
  @Output() gifLoadStart = new EventEmitter<string>();
  @Output() gifLoadComplete = new EventEmitter<string>();

  public playVideo(e: Event, gif: IGif) {
    const video = e.target as HTMLVideoElement;

    if (video.readyState === 4) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    } else {
      if (video.getAttribute('data-event-loaddeddata') !== 'true') {
        this.gifLoadStart.emit(gif.permalink);
        video.load();

        const handleVideoLoaded = async () => {
          this.gifLoadComplete.emit(gif.permalink);
          await video.play();
          video.removeEventListener('loadeddata', handleVideoLoaded);
        };

        video.addEventListener('loadeddata', handleVideoLoaded);
        video.setAttribute('data-event-loadeddata', 'true');
      }
    }
  }

  public showComments(gif: IGif) {
    Browser.open({
      toolbarColor: '#fff',
      url: `https://reddit.com/${gif.permalink}`,
      windowName: '_system',
    });
  }

  public trackByFn(index: number, gif: IGif) {
    return gif.permalink;
  }
}
