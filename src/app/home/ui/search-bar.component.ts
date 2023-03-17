import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-search-bar',
  template: `
    <ion-searchbar
      [formControl]="searchForm"
      show-clear-button="focus"
      animated
      placeholder="subreddit..."
      value=""
    ></ion-searchbar>
  `,
  styles: [
    `
      ion-searchbar {
        padding: 0 5px;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBarComponent {
  @Input() searchForm!: FormControl;
}
