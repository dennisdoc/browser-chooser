import { ApplicationConfig } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';

// Hash routing is required because Electron loads the app from file://
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes, withHashLocation()), provideAnimationsAsync()],
};
