# OC Dashporter — Windows

A native Windows desktop app for remote access to your [OpenClaw](https://openclaw.ai) installation.

OC Dashporter wraps the OpenClaw built-in Control UI in an Electron shell, giving you a proper installable app with persistent authentication — no browser, no token prompts, no storage clearing.

## How it works

OC Dashporter connects directly to your OpenClaw gateway over your Tailscale network. Your gateway runs on your home machine as normal. The app is just a secure native window into it from anywhere.
```
Windows Laptop
└── OC Dashporter
    └── Tailscale → Your OpenClaw gateway
                    └── All agents, models, memory, sessions
```

## Requirements

- OpenClaw installed and running on a host machine
- Tailscale with the host machine on your tailnet
- The host gateway exposed via Tailscale Serve
- Windows 11

## Installation

1. Download the latest installer:
   [oc-dashporter-setup.exe](https://github.com/SamaritanOC/oc-dashporter/releases/latest/download/oc-dashporter-setup.exe)

2. Run the installer and follow the setup wizard
3. Choose your installation directory (or leave as default)
4. OC Dashporter will be added to your Start Menu and Desktop

## First launch

1. Open OC Dashporter from your Start Menu or Desktop shortcut
2. Enter your gateway URL (e.g. https://your-machine.tailnet-name.ts.net)
3. Enter your gateway token (found in ~/.openclaw/openclaw.json on your host machine under gateway.auth.token)
4. Click Connect
5. On your OpenClaw host, approve the pairing request:
```bash
openclaw devices list
openclaw devices approve <requestId>
```

Pairing is a one-time step per device. After that the app connects automatically on every launch.

## Updating

Download and run the latest installer from the link above. Your pairing and settings are preserved — no re-pairing required.

## Troubleshooting

### Windows SmartScreen warning

When running the installer for the first time, Windows SmartScreen may show a warning. This is normal for unsigned apps.

**To proceed:**
1. Click **More info**
2. Click **Run anyway**

### Pairing approval

When you open OC Dashporter for the first time and enter your gateway URL and token, the gateway registers a new device and waits for operator approval.

**To approve:**
1. Open Mission Control or the OpenClaw webchat on your gateway host
2. Go to **Devices** — you will see a pending device entry
3. Approve it

Pairing codes expire after **1 hour**. If approval times out, close OC Dashporter, reopen it, and approve the new pairing request before the hour is up.

If you do not see a pending device, confirm your gateway URL is correct and that Tailscale is connected on both machines.

## License

MIT

## Support The Samaritan Project

This is an active, build-in-public project focused on developing replicable, private agentic AI infrastructure that can be deployed across any industry or use case. If you're interested in where local-first AI is headed, and want to support the hardware and infrastructure that makes this possible, follow along and contribute at [The Samaritan Project — Buy Me A Coffee](https://buymeacoffee.com/thesamaritanproject)
