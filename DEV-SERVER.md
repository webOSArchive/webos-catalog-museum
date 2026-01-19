# Development Server

This project includes a custom Python dev server that handles path aliasing for the webOS Enyo framework.

## The Problem

The app expects the Enyo framework at the device path:
```
/usr/palm/frameworks/enyo/0.10/framework/enyo.js
```

But on a development machine with the Palm SDK installed, the framework is at:
```
/opt/PalmSDK/Current/share/framework/enyo/1.0/framework/enyo.js
```

## The Solution

`dev-server.py` is a simple HTTP server that intercepts requests and rewrites paths:

| Request Path | Served From |
|--------------|-------------|
| `/usr/palm/frameworks/enyo/0.10/` | `/opt/PalmSDK/Current/share/framework/enyo/1.0/` |
| `/usr/palm/frameworks/` | `/opt/PalmSDK/Current/share/framework/` |
| Everything else | Project directory |

## Usage

Start the server:
```bash
python3 dev-server.py
```

Then open http://localhost:8080 in your browser.

## Requirements

- Python 3
- Palm SDK installed at `/opt/PalmSDK/Current/`

## Customizing

Edit the `ALIASES` dict in `dev-server.py` to add or modify path mappings:

```python
ALIASES = {
    '/usr/palm/frameworks/enyo/0.10/': '/opt/PalmSDK/Current/share/framework/enyo/1.0/',
    '/usr/palm/frameworks/': '/opt/PalmSDK/Current/share/framework/'
}
```

To change the port, edit the `PORT` variable at the top of the file.
