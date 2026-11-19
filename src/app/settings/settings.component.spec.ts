import { TestBed } from '@angular/core/testing';
import { Browser, Config, ElectronService } from '../electron.service';
import { SettingsComponent } from './settings.component';

describe('SettingsComponent', () => {
  it('detects browsers on first launch and selects Brave as the default', async () => {
    const detected: Browser[] = [
      { id: 'brave', name: 'Brave', path: 'C:\\Browsers\\brave.exe' },
      { id: 'google-chrome', name: 'Google Chrome', path: 'C:\\Browsers\\chrome.exe' },
    ];
    let detectCalls = 0;

    await TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [{
        provide: ElectronService,
        useValue: {
          api: {
            getConfig: async (): Promise<Config> => ({
              browsers: [],
              rules: [],
              defaultBrowserId: null,
              delaySeconds: 2,
            }),
            detectBrowsers: async () => {
              detectCalls++;
              return detected;
            },
          },
        },
      }],
    }).compileComponents();

    const fixture = TestBed.createComponent(SettingsComponent);
    await fixture.componentInstance.ngOnInit();

    expect(detectCalls).toBe(1);
    expect(fixture.componentInstance.cfg()?.browsers).toEqual(detected);
    expect(fixture.componentInstance.cfg()?.defaultBrowserId).toBe('brave');
  });
});
