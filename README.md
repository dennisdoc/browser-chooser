# Browser Chooser

Browser Chooser is a Windows desktop app built with Electron, Angular, and Angular
Material. It routes HTTP and HTTPS links to browsers based on their domains.

## Features

- Detect installed browsers or add a browser executable manually.
- Route domains and their subdomains to a chosen browser.
- Choose a default browser for all other links.
- Pause the default-browser countdown by holding Shift to choose a browser.
- Save settings as JSON in Electron's user data folder.

## Development

Install Node.js and npm, then install the project dependencies:

```sh
npm install
```

Run the app with live Angular updates:

```sh
npm run electron:dev
```

Run the unit tests:

```sh
npm test -- --watch=false
```

## Build the Windows installer

```sh
npm run dist
```

The NSIS installer is generated in `dist/`. After installing, use **Set as
default browser** in the app and select Browser Chooser in Windows Default apps.

## Configure routing

1. Use **Refresh browser list** to detect installed browsers, or add one manually.
2. Add domain rules such as `claude.ai`, `instagram.com`, or `gmail.com`.
   Rules also match subdomains.
3. Select a default browser and configure the countdown delay.
4. Save the settings.

Settings are stored as `settings.json` under Electron's `userData` directory
(typically `%APPDATA%\Browser Chooser\settings.json` on Windows).
