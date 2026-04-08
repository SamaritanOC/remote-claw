![RemoteClaw for Linux](https://labb.run/wp-content/uploads/2026/03/Linux-App-Update.png)

# 🦞 RemoteClaw

A native desktop app for remote access to your [OpenClaw](https://openclaw.ai) installation.

RemoteClaw installs your fully functional, default OpenClaw Mission Control dashboard on a remote Windows or Linux computer.

## Download

| OS | Download |
|---|---|
| Linux (Debian/Ubuntu/Parrot) | [remoteclaw-amd64.deb](https://github.com/SamaritanOC/remoteclaw/releases/latest/download/remoteclaw-amd64.deb) |
| Windows 11 | [remoteclaw-windows-setup.exe](https://github.com/SamaritanOC/remoteclaw/releases/latest/download/remoteclaw-windows-setup.exe) |

For Windows installation instructions see [windows/README.md](windows/README.md).

---

## Linux

### How it works

RemoteClaw for Linux connects directly to your OpenClaw gateway over your Tailscale network. Your gateway runs on your home machine as normal. The app is just a secure native window into it from anywhere.
```
Road Laptop
└── RemoteClaw for Linux
    └── Tailscale → Your OpenClaw gateway
                    └── All agents, models, memory, sessions
```

### Requirements

- OpenClaw installed and running on a host machine
- Tailscale with the host machine on your tailnet
- The host gateway exposed via Tailscale Serve
- Any 64-bit Linux desktop

### Host configuration

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

### Installation

**Option 1 — click to install:** download `remoteclaw-amd64.deb` and double-click it. Your software center will open and install it.

**Option 2 — command line:**
```bash
sudo apt install ./remoteclaw-amd64.deb
```
![RemoteClaw for Linux](https://labb.run/wp-content/uploads/2026/03/Mission-Control.png)

### Updating

#### Automatic (recommended)
RemoteClaw for Linux checks for updates automatically on every launch. When a new version is available it downloads in the background and prompts you to restart to apply it.

#### Manual
Download the latest `.deb` from the [releases page](https://github.com/SamaritanOC/remoteclaw/releases) and install using either option above.

### First launch

1. Open RemoteClaw for Linux
2. Enter your gateway URL (e.g. https://your-machine.tailnet-name.ts.net)
3. Enter your gateway token (found in ~/.openclaw/openclaw.json under gateway.auth.token)
4. Click Connect
5. On your OpenClaw host, approve the pairing request:
```bash
openclaw devices list
openclaw devices approve <requestId>
```

Pairing is a one-time step per device. After that the app connects automatically on every launch.

### Troubleshooting

#### Display / Wayland issues

RemoteClaw for Linux is an Electron app. On Linux systems running Wayland, the app may fail to launch or render a blank window.

**Fix — force XWayland mode:**
```bash
./remoteclaw-amd64.AppImage --ozone-platform=x11
```

Or set it permanently by editing your launcher/desktop entry to include `--ozone-platform=x11` in the `Exec=` line.

On GNOME + Wayland, you can also try:
```bash
GDK_BACKEND=x11 ./remoteclaw-amd64.AppImage
```

#### Pairing approval

When you open RemoteClaw for Linux for the first time and enter your gateway URL and token, the gateway registers a new device and waits for operator approval.

**To approve:**
1. Open Mission Control or the OpenClaw webchat on your gateway host
2. Go to **Devices** — you will see a pending device entry
3. Approve it

Pairing codes expire after **1 hour**. If approval times out, close RemoteClaw for Linux, reopen it, and approve the new pairing request before the hour is up.

If you do not see a pending device, confirm your gateway URL is correct and that Tailscale is connected on both machines.

---

## License

MIT

## Support The Samaritan Project

This tool is part of the Samaritan Project, a build-in-public OSINT platform running on self-hosted AI infrastructure. Follow along and contribute at [The Samaritan Project — Buy Me A Coffee](https://buymeacoffee.com/thesamaritanproject)
