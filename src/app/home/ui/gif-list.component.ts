import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { IGif } from 'src/app/shared/interfaces/gif.interface';

@Component({
  selector: 'app-gif-list',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-list lines="none">
      <div class="gif" *ngFor="let gif of gifs; trackBy: trackByFn">
        <ion-item button [detail]="false">
          <video
            playsInline
            poster="none"
            preload="none"
            [loop]="true"
            [muted]="true"
            [src]="gif.src"
          ></video>
          <ion-label>{{ gif.title }}</ion-label>
        </ion-item>
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

  public trackByFn(index: number, gif: IGif) {
    return gif.permalink;
  }
}
