# URL Router

URL Router is a Windows desktop app built with Electron, Angular, and Angular
Material. It routes HTTP and HTTPS links to browsers based on their domains.

## Features

- Detect installed browsers or add a browser executable manually.
- Route domains and their subdomains to a chosen browser.
- Choose a default browser for all other links.
- Pause the default-browser countdown by holding Shift to choose a browser.
- Save settings as JSON in Electron's user data folder.

## UI

- Still needs a lot of work but for now pretty basic angular material

<img width="869" height="601" alt="image" src="https://github.com/user-attachments/assets/26c9c7e0-0a9a-48c2-aba8-40b31978f691" />
<img width="881" height="185" alt="image" src="https://github.com/user-attachments/assets/3baa3fd4-c192-4289-94ea-700eee2eaf60" />
<img width="466" height="360" alt="image" src="https://github.com/user-attachments/assets/d1d29a3e-c717-4db2-9f29-00d2d558a46e" />




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
default browser** in the app and select URL Router in Windows Default apps.

## Configure routing

1. Use **Refresh browser list** to detect installed browsers, or add one manually.
2. Add domain rules such as `claude.ai`, `instagram.com`, or `gmail.com`.
   Rules also match subdomains.
3. Select a default browser and configure the countdown delay.
4. Save the settings.

Settings are stored as `settings.json` under Electron's `userData` directory
(typically `%APPDATA%\url-router\settings.json` on Windows).
