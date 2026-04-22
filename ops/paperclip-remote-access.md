# Paperclip Remote Access — Tailscale Setup

Paperclip runs on the Windows box and is exposed only to devices on Anthony's personal tailnet. No public internet exposure. No DNS changes at Porkbun.

## The URL

**https://paperclip.taila8b3ff.ts.net**

Works from any device that's logged into the `unclemays.com` tailnet (tailnet name matches the Google Workspace domain). Shows the Paperclip UI.

## Access from other devices

Each device you want to use (phone, laptop, iPad) needs Tailscale installed and logged into your tailnet. One-time setup per device.

| Device | Install |
|--------|---------|
| iPhone / iPad | App Store → search "Tailscale" → install → sign in with Google (anthony@ or info@unclemays.com) |
| Android | Play Store → "Tailscale" → install → sign in with Google |
| macOS | https://tailscale.com/download/mac → install → sign in with Google |
| Other Windows | https://tailscale.com/download/windows → install → sign in with Google |
| Linux | `curl -fsSL https://tailscale.com/install.sh \| sh; sudo tailscale up` |

After install, just open **https://paperclip.taila8b3ff.ts.net** in any browser on the device. MagicDNS handles the DNS inside the tunnel.

## Turn Paperclip ON (resume Claude-consuming work)

**Easiest**: double-click `C:\Users\Anthony\Desktop\um_website\ops\start-paperclip.cmd`.

The window shows Paperclip booting. Leave it open. Closing the window stops the server. Embedded Postgres persists between Paperclip runs; the tailnet URL starts working within ~10 seconds of Paperclip being up.

Manual equivalent:
```
cd C:\Users\Anthony\Desktop\um_website
npx paperclipai run
```

## Turn Paperclip OFF (pause all Claude usage)

**Easiest**: double-click `C:\Users\Anthony\Desktop\um_website\ops\stop-paperclip.cmd`.

This finds the Node process listening on port 3100 and kills it. All 14 agent heartbeats stop immediately. Postgres keeps running (free, no Claude cost). The tailnet URL returns a 502 until Paperclip comes back up.

Alternatives:
- Close the terminal window running `paperclipai run`.
- From a second terminal: `taskkill //F //PID <pid>` where `<pid>` is from `netstat -ano | findstr :3100`.

## Scheduled on/off (optional)

If you want Paperclip to auto-start and auto-stop on a daily schedule (e.g. 7am–8pm), ask the CIO agent to configure Windows Task Scheduler jobs pointing at these two `.cmd` files. The CIO owns that setup.

## Tailscale management

- **Status on this machine**: `tailscale status`
- **List devices in tailnet**: `tailscale status --peers`
- **Stop sharing / turn off tunnel**: `tailscale down` (tailnet access stops — even you lose access until you run `tailscale up`)
- **Serve config**: `tailscale serve status` (should show `https://paperclip.taila8b3ff.ts.net → proxy http://127.0.0.1:3100`)
- **Reset the serve config** if it ever gets lost:
  ```
  tailscale serve --https=443 --bg http://127.0.0.1:3100
  ```
- **Admin dashboard**: https://login.tailscale.com/admin/machines

## What's running (quick reference)

| Service | Process | On/off |
|---------|---------|--------|
| Paperclip server | `node paperclipai run` | Manual (see above) |
| Embedded Postgres | `postgres.exe` cluster | Auto-starts with Paperclip; persists |
| Tailscale tunnel | `tailscaled.exe` (service) | Auto-starts with Windows |
| Tailscale Serve config | Stored in tailnet config | Persists across reboots |
| `cloudflared` | Not in use anymore | Can be uninstalled |

## Security notes

- Tailnet access is device-authenticated via WireGuard. A device without your Tailscale login cannot see the URL at all.
- TLS cert for `paperclip.taila8b3ff.ts.net` auto-provisioned by Tailscale via Let's Encrypt, renewed automatically.
- The hostname `paperclip.taila8b3ff.ts.net` is allowlisted in Paperclip (`paperclipai allowed-hostname`). Adding new hostnames requires editing that allowlist and restarting.
- If you lose a device, remove it from https://login.tailscale.com/admin/machines — it instantly loses access.
