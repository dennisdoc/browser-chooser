import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Config, ElectronService } from '../electron.service';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, MatToolbarModule, MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatSliderModule, MatSnackBarModule],
  styles: [`
    .page { max-width: 820px; margin: 0 auto; padding: 16px; display: grid; gap: 16px; }
    .row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    .grow { flex: 1; min-width: 180px; }
    .path { opacity: .65; font-size: 12px; }
  `],
  template: `
    <mat-toolbar color="primary">
      <span>Browser Chooser</span>
      <span style="flex:1"></span>
      <button mat-button (click)="setDefault()">Set as default browser</button>
      <button mat-flat-button (click)="save()">Save</button>
    </mat-toolbar>

    @if (cfg(); as c) {
    <div class="page">
      <mat-card>
        <mat-card-header><mat-card-title>Browsers</mat-card-title></mat-card-header>
        <mat-card-content>
          @for (b of c.browsers; track b.id) {
            <div class="row">
              <mat-form-field class="grow"><mat-label>Name</mat-label><input matInput [(ngModel)]="b.name"></mat-form-field>
              <span class="grow path">{{ b.path }}</span>
              <button mat-icon-button (click)="removeBrowser(b.id)"><mat-icon>delete</mat-icon></button>
            </div>
          } @empty { <p>No browsers yet. Detect installed ones or add an .exe manually.</p> }
        </mat-card-content>
        <mat-card-actions>
          <button mat-button (click)="detect()"><mat-icon>refresh</mat-icon> Refresh browser list</button>
          <button mat-button (click)="addManual()"><mat-icon>add</mat-icon> Add manually</button>
        </mat-card-actions>
      </mat-card>

      <mat-card>
        <mat-card-header><mat-card-title>Rules</mat-card-title></mat-card-header>
        <mat-card-content>
          <p class="path">Enter a domain or paste a URL. Rules match subdomains too. Example: <b>claude.ai</b>, <b>instagram.com</b>. First matching rule wins.</p>
          @for (r of c.rules; track $index) {
            <div class="row">
              <mat-form-field class="grow"><mat-label>Domain</mat-label><input matInput [(ngModel)]="r.pattern"></mat-form-field>
              <mat-form-field class="grow"><mat-label>Open in</mat-label>
                <mat-select [(ngModel)]="r.browserId">
                  @for (b of c.browsers; track b.id) { <mat-option [value]="b.id">{{ b.name }}</mat-option> }
                </mat-select>
              </mat-form-field>
              <button mat-icon-button (click)="c.rules.splice($index, 1)"><mat-icon>delete</mat-icon></button>
            </div>
          }
        </mat-card-content>
        <mat-card-actions><button mat-button (click)="addRule()"><mat-icon>add</mat-icon> Add rule</button></mat-card-actions>
      </mat-card>

      <mat-card>
        <mat-card-header><mat-card-title>Everything else</mat-card-title></mat-card-header>
        <mat-card-content>
          <div class="row">
            <mat-form-field class="grow"><mat-label>Default browser</mat-label>
              <mat-select [(ngModel)]="c.defaultBrowserId">
                @for (b of c.browsers; track b.id) { <mat-option [value]="b.id">{{ b.name }}</mat-option> }
              </mat-select>
            </mat-form-field>
            <div class="grow">
              <div>Wait before opening: <b>{{ c.delaySeconds }}s</b> (0 = open immediately)</div>
              <mat-slider min="0" max="10" step="1" discrete><input matSliderThumb [(ngModel)]="c.delaySeconds"></mat-slider>
            </div>
          </div>
          <p class="path">Hold Shift during the countdown to stop it and pick a browser manually.</p>
        </mat-card-content>
      </mat-card>
    </div>
    }
  `,
})
export class SettingsComponent implements OnInit {
  private el = inject(ElectronService);
  private snack = inject(MatSnackBar);
  cfg = signal<Config | null>(null);

  async ngOnInit() {
    const config = await this.el.api.getConfig();
    this.cfg.set(config);
    if (config.browsers.length === 0) await this.detect();
  }

  async detect() {
    const detected = await this.el.api.detectBrowsers();
    const current = this.cfg();
    if (!current) return;

    const browsers = [...current.browsers];
    for (const browser of detected) {
      if (!browsers.some((existing) => existing.path === browser.path)) browsers.push(browser);
    }

    this.cfg.set({
      ...current,
      browsers,
      defaultBrowserId: current.defaultBrowserId ?? browsers.find((b) => b.id === 'brave')?.id ?? browsers[0]?.id ?? null,
    });

    if (detected.length === 0) {
      this.snack.open('No browsers detected. Add one manually.', undefined, { duration: 3000 });
    }
  }
  async addManual() {
    const p = await this.el.api.pickExe();
    if (!p) return;
    const name = p.split(/[\\/]/).pop()!.replace(/\.(exe|app)$/i, '');
    this.cfg()!.browsers.push({ id: crypto.randomUUID(), name, path: p });
  }
  removeBrowser(id: string) {
    const c = this.cfg()!;
    c.browsers = c.browsers.filter((b) => b.id !== id);
    c.rules = c.rules.filter((r) => r.browserId !== id);
    if (c.defaultBrowserId === id) c.defaultBrowserId = null;
  }
  addRule() { this.cfg()!.rules.push({ pattern: '', browserId: this.cfg()!.browsers[0]?.id ?? '' }); }
  async save() {
    const c = this.cfg()!;
    c.rules = c.rules.filter((r) => r.pattern.trim() && r.browserId);
    await this.el.api.saveConfig(c);
    this.snack.open('Settings saved', undefined, { duration: 2000 });
  }
  setDefault() { this.el.api.setDefault(); }
}
