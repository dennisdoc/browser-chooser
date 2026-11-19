import { Routes } from '@angular/router';
import { SettingsComponent } from './settings/settings.component';
import { RedirectComponent } from './redirect/redirect.component';

export const routes: Routes = [
  { path: 'settings', component: SettingsComponent },
  { path: 'redirect', component: RedirectComponent },
  { path: '', pathMatch: 'full', redirectTo: 'settings' },
];
