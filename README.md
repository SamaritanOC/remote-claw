# OC Dashporter

A native Linux desktop app for remote access to your [OpenClaw](https://openclaw.ai) installation.

OC Dashporter wraps the OpenClaw built-in Control UI in an Electron shell, giving you a proper installable app with persistent authentication — no browser, no token prompts, no storage clearing.

## How it works

OC Dashporter connects directly to your OpenClaw gateway over your Tailscale network. Your gateway runs on your home machine as normal. The app is just a secure native window into it from anywhere.

Road Laptop
└── OC Dashporter
    └── Tailscale → Your OpenClaw gateway
                    └── All agents, models, memory, sessions

## Requirements

- OpenClaw installed and running on a host machine
- Tailscale with the host machine on your tailnet
- The host gateway exposed via Tailscale Serve
- Any Debian-based Linux on the remote machine

## Host configuration

Add this to your openclaw.json gateway block:
```json
"tailscale": {
  "mode": "serve"
},
"auth": {
  "mode": "token",
  "allowTailscale": true
},
"controlUi": {
  "allowedOrigins": ["https://your-tailscale-hostname"]
}
```

## Installation

Download the latest release:
```bash
wget https://github.com/SamaritanOC/oc-dashporter/releases/latest/download/oc-dashporter-amd64.deb
sudo dpkg -i oc-dashporter-amd64.deb
```

Or build from source:
```bash
git clone https://github.com/SamaritanOC/oc-dashporter.git
cd oc-dashporter
npm install
npm run electron:build
sudo dpkg -i dist-app/oc-dashporter-*-amd64.deb
```

## First launch

1. Open OC Dashporter from your application menu
2. Enter your gateway URL (e.g. https://your-machine.tailnet-name.ts.net)
3. Enter your gateway token (found in ~/.openclaw/openclaw.json under gateway.auth.token)
4. Click Connect
5. On your OpenClaw host, approve the pairing request:
```bash
openclaw devices list
openclaw devices approve <requestId>
```

Pairing is a one-time step per device. After that the app connects automatically on every launch.

## Updates

When OpenClaw updates its built-in Control UI, OC Dashporter picks up the changes automatically. The UI always comes directly from your gateway — nothing to update on the client side.

## Troubleshooting

### Display / Wayland issues

OC Dashporter is an Electron app. On Linux systems running Wayland, the app may fail to launch or render a blank window.

**Fix — force XWayland mode:**
```bash
./OC-Dashporter.AppImage --ozone-platform=x11
```

Or set it permanently by editing your launcher/desktop entry to include `--ozone-platform=x11` in the `Exec=` line.

On GNOME + Wayland, you can also try:
```bash
GDK_BACKEND=x11 ./OC-Dashporter.AppImage
```

### Pairing approval

When you open DashPorter for the first time and enter your gateway URL and token, the gateway registers a new device and waits for operator approval.

**To approve:**
1. Open Mission Control or the OpenClaw webchat on your gateway host
2. Go to **Devices** — you will see a pending device entry
3. Approve it

Pairing codes expire after **1 hour**. If approval times out, close DashPorter, reopen it, and approve the new pairing request before the hour is up.

If you do not see a pending device, confirm your gateway URL is correct and that Tailscale is connected on both machines.

## License

MIT
