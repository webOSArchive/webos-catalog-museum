# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **webOS App Museum II** - an Enyo-based app catalog frontend for legacy webOS devices (Palm Pre, Pixi, HP Pre3, TouchPad, and LuneOS). The frontend connects to a separate backend API at https://github.com/webosarchive/webos-catalog-backend.

Live web version: http://appcatalog.webosarchive.org

## Build & Deploy Commands

This project uses Palm SDK tools, not npm/webpack:

```bash
# Build .ipk package
./.vscode/build.sh
# Or directly: palm-package /path/to/project

# Deploy to connected webOS device/emulator
./.vscode/run.sh
# Or directly: palm-run /path/to/project
```

VS Code tasks are configured for both (`palm-build` and `palm-run`).

## Technology Stack

- **Framework:** Enyo 0.10 (legacy webOS JavaScript UI framework)
- **Language:** ES5 JavaScript (no transpilation)
- **No build system:** Enyo handles dependency loading via `depends.js` files
- **No test suite or linting infrastructure**

## Architecture

```
index.html
    ↓
Enyo Framework (loaded from device: /usr/palm/frameworks/enyo/0.10/)
    ↓
depends.js (root dependency loader)
    ├── init/        → Global state, device detection, config
    │   └── banneret.js  → Global state object, preferences (stored in cookies)
    ├── styles/      → CSS
    └── app/         → UI components
        └── museumApp.js  → Root component (3-panel SlidingPane layout)
            ├── Categories panel (left)
            ├── AppList panel (center, uses VirtualList)
            └── Details panel (right)
```

## Key Patterns

**Enyo Components:** Defined with `enyo.kind()`, using component inheritance and event-based communication (`onChange`, `onSuccess`, etc.)

**Global State:** The `banneret` object (in `init/banneret.js`) holds all preferences, favorites, device filters, and app state. Preferences persist via browser cookies.

**Backend Communication:** `MasterWebService` component makes POST requests to the backend API. Configuration is fetched dynamically from `/getConfig.php`.

**Device Detection:** Auto-detects device type via `window.PalmSystem.deviceInfo` or screen dimensions. Filters apps by compatible devices (Pre, Pixi, Pre2, Veer, Pre3, TouchPad, LuneOS).

## Key Files

- `appinfo.json` - webOS app manifest (ID: `com.palm.app-museum2`)
- `init/banneret.js` - Global state and preferences management
- `app/museumApp.js` - Root application component
- `app/appList.js` - Main app list with infinite scroll
- `app/details.js` - App detail view
- `app/preferencesPopup.js` - Settings dialog
