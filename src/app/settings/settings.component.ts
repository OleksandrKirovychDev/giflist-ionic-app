import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, PopoverController } from '@ionic/angular';

import { SettingsFromComponent } from './ui/settings-form.component';
import { SettingsService } from '../shared/data-access/settings.service';
import { ISettings } from '../shared/interfaces';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    SettingsFromComponent,
  ],
  template: `
    <ion-header>
      <ion-toolbar color="light">
        <ion-buttons slot="end">
          <ion-button (click)="popoverCtrl.dismiss()">
            <ion-icon slot="icon-only" name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <app-settings-form
        [settingsForm]="settingsForm"
        (save)="handleSave()"
      ></app-settings-form>
    </ion-content>
  `,
  styles: [
    `
      :host {
        height: 100%;
      }

      ion-segment {
        --ion-background-color: #fff;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  public settingsForm = this.fb.nonNullable.group<ISettings>({
    perPage: 10,
    sort: 'hot',
  });

  constructor(
    private fb: FormBuilder,
    public settingsService: SettingsService,
    public popoverCtrl: PopoverController
  ) {}

  public handleSave() {
    this.settingsService.save(this.settingsForm.getRawValue());
    this.popoverCtrl.dismiss();
  }
}
