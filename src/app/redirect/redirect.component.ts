import { Component, HostListener, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { ElectronService, PromptData } from '../electron.service';

@Component({
  selector: 'app-redirect',
  imports: [MatButtonModule, MatProgressBarModule, MatListModule],
  styles: [`
    :host { display: block; padding: 20px; height: 100vh; box-sizing: border-box; }
    .url { word-break: break-all; font-size: 13px; opacity: .75; margin: 8px 0 16px; max-height: 3.6em; overflow: hidden; }
    .actions { display: flex; gap: 8px; margin-top: 16px; }
  `],
  template: `
    @if (data(); as d) {
      @if (!paused()) {
        <h2>Opening in {{ defaultName() }} in {{ remaining() }}s</h2>
        <div class="url">{{ d.url }}</div>
        <mat-progress-bar mode="determinate" [value]="progress()" />
        <p>Hold <b>Shift</b> to choose another browser.</p>
        <div class="actions">
          <button mat-flat-button (click)="open(d.defaultBrowserId)">Open now</button>
          <button mat-button (click)="cancel()">Cancel</button>
        </div>
      } @else {
        <h2>Open with…</h2>
        <div class="url">{{ d.url }}</div>
        <mat-action-list>
          @for (b of d.browsers; track b.id) {
            <button mat-list-item (click)="open(b.id)">{{ b.name }}</button>
          }
        </mat-action-list>
        <div class="actions"><button mat-button (click)="cancel()">Cancel</button></div>
      }
    }
  `,
})
export class RedirectComponent implements OnInit, OnDestroy {
  private el = inject(ElectronService);
  data = signal<PromptData | null>(null);
  remaining = signal(0);
  progress = signal(0);
  paused = signal(false);
  private timer?: ReturnType<typeof setInterval>;
  private startedAt = 0;
  private totalMs = 0;

  defaultName() { const d = this.data()!; return d.browsers.find((b) => b.id === d.defaultBrowserId)?.name ?? 'default browser'; }

  async ngOnInit() {
    const d = await this.el.api.getPrompt();
    this.data.set(d);
    this.totalMs = d.delay * 1000;
    this.startedAt = Date.now();
    this.remaining.set(d.delay);
    this.timer = setInterval(() => {
      const elapsed = Date.now() - this.startedAt;
      this.remaining.set(Math.max(0, Math.ceil((this.totalMs - elapsed) / 1000)));
      this.progress.set(Math.min(100, (elapsed / this.totalMs) * 100));
      if (elapsed >= this.totalMs) this.open(d.defaultBrowserId);
    }, 50);
  }
  ngOnDestroy() { clearInterval(this.timer); }

  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (e.key === 'Shift' && !this.paused()) { clearInterval(this.timer); this.paused.set(true); }
    if (e.key === 'Escape') this.cancel();
  }

  open(id: string) { clearInterval(this.timer); this.el.api.promptOpen(id); }
  cancel() { clearInterval(this.timer); this.el.api.promptCancel(); }
}
