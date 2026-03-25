
---

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

---

### Pairing approval

When you open DashPorter for the first time and enter your gateway URL and token, the gateway registers a new device and waits for operator approval.

**To approve:**
1. Open Mission Control or the OpenClaw webchat on your gateway host
2. Go to **Devices** — you will see a pending device entry
3. Approve it

Pairing codes expire after **1 hour**. If approval times out, close DashPorter, reopen it, and approve the new pairing request before the hour is up.

If you do not see a pending device, confirm your gateway URL is correct and that Tailscale is connected on both machines.
