# Changelog

All notable changes to RemoteClaw for Windows are documented here.

## [1.0.0] - 2026-03-28

### Added
- Initial release of RemoteClaw for Windows
- NSIS installer (.exe) built via GitHub Actions
- Electron shell wrapping the OpenClaw Control UI
- Tailscale-based remote gateway connectivity
- Persistent token authentication via Electron session
- Auto-updater via `electron-updater` — checks for updates on launch, downloads in background, prompts to restart when ready
- Security hardening: `sandbox: true`, `webSecurity: true`, `will-navigate` guard, `setWindowOpenHandler`
- Desktop shortcut and Start Menu entry created on install
