import { Injectable } from '@angular/core';

export interface Browser { id: string; name: string; path: string; }
export interface Rule { pattern: string; browserId: string; }
export interface Config { browsers: Browser[]; rules: Rule[]; defaultBrowserId: string | null; delaySeconds: number; }
export interface PromptData { url: string; delay: number; defaultBrowserId: string; browsers: Browser[]; }

declare global {
  interface Window {
    api: {
      getConfig(): Promise<Config>;
      saveConfig(c: Config): Promise<boolean>;
      pickExe(): Promise<string | null>;
      detectBrowsers(): Promise<Browser[]>;
      setDefault(): Promise<boolean>;
      getPrompt(): Promise<PromptData>;
      promptOpen(id: string): Promise<void>;
      promptCancel(): Promise<void>;
    };
  }
}

@Injectable({ providedIn: 'root' })
export class ElectronService {
  get api() { return window.api; }
}
