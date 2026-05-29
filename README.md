# DonutSMP Session Runner

Mineflayer runner for starting several Minecraft accounts from local session JSON
files. It can join a server, run configurable commands, move inside a small AFK
area, log chat/status, and use a SOCKS proxy per bot.

This project is for personal use on servers where automation is allowed. Do not
sell it, resell it, rebrand it, or upload private account/session files.

## What Is New In 1.1.0

- Human movement system with random walk bursts, sprint, strafe, jump, sneak,
  smooth head turns, idle pauses, and radius limits.
- Movement before spawn commands, configurable in seconds.
- Per-bot config overrides.
- Per-bot SOCKS4/SOCKS5 proxy support.
- Per-bot chat log on/off.
- Configurable command mode: send all commands or pick one random command.
- Periodic status log with health, food, game mode, dimension, and position.
- Built-in tests with `npm test`.

## Install

Install Node.js 22 or newer.

Check it:

```bash
node -v
```

Good examples:

```txt
v22.x
v23.x
v24.x
```

Open this project folder, the folder that contains `package.json`.

Windows example:

```powershell
cd "C:\Users\YourName\Downloads\donutsmp-session-runner"
```

Install modules:

```bash
npm install
```

Windows users can also double-click:

```txt
install.bat
```

## Start

First check that accounts load:

```bash
npm run dry
```

Start the bots:

```bash
npm start
```

Windows users can also double-click:

```txt
start.bat
```

## Files You Edit

Most users edit only these:

```txt
config.json
cookies/*.json
accounts.json
```

Never upload these:

```txt
cookies/*.json
accounts.json
profiles/
logs/
.env
```

## Server Config

Open `config.json`.

```json
{
  "connection": {
    "host": "donutsmp.net",
    "port": 25565,
    "version": "1.21.11",
    "auth": "offline",
    "physicsEnabled": true
  }
}
```

Meaning:

- `host`: server IP or domain.
- `port`: server port, usually `25565`.
- `version`: Minecraft version accepted by the server.
- `auth`: fallback auth mode when an account file has no session.
- `physicsEnabled`: must stay `true` for normal Mineflayer movement.

## Add Accounts

### Option A: One File Per Account

Put JSON files inside `cookies/`.

```txt
cookies/
  bot1.json
  bot2.json
```

Example:

```json
{
  "profile": {
    "name": "AccountName",
    "id": "minecraft-java-profile-uuid-here"
  },
  "ygg": {
    "token": "minecraft-java-access-token-here"
  },
  "refreshToken": "optional-microsoft-refresh-token-here"
}
```

### Option B: All Accounts In One File

Create `accounts.json`:

```json
{
  "accounts": [
    {
      "profile": {
        "name": "AccountName",
        "id": "minecraft-java-profile-uuid-here"
      },
      "ygg": {
        "token": "minecraft-java-access-token-here"
      }
    }
  ]
}
```

## Per-Bot Config

Each account can override global config.

Example:

```json
{
  "profile": {
    "name": "BotOne",
    "id": "minecraft-java-profile-uuid-here"
  },
  "ygg": {
    "token": "minecraft-java-access-token-here"
  },
  "proxy": "proxyOne",
  "features": {
    "chatLog": false,
    "statusLog": true
  },
  "donut": {
    "spawnCommands": ["/afk 30"],
    "commandMode": "all",
    "preCommandMovement": {
      "enabled": true,
      "seconds": 5
    }
  },
  "humanMovement": {
    "enabled": true,
    "radiusBlocks": 5,
    "sprintChance": 0.45
  }
}
```

Shortcut to disable chat log on one bot:

```json
{
  "name": "BotOne",
  "disableChatLog": true
}
```

## Proxy Config

The proxy is for the Minecraft server TCP connection.

In `config.json`:

```json
{
  "network": {
    "proxy": null,
    "proxies": {
      "proxyOne": {
        "protocol": "socks5",
        "host": "127.0.0.1",
        "port": 1080,
        "username": "",
        "password": ""
      }
    }
  }
}
```

Use it on one account:

```json
{
  "name": "BotOne",
  "proxy": "proxyOne"
}
```

Two bots can use the same proxy name. You can also put the proxy URL directly:

```json
{
  "name": "BotOne",
  "proxy": "socks5://user:pass@127.0.0.1:1080"
}
```

Supported:

- `socks4`
- `socks5`
- optional username/password

## Commands

Spawn commands are in `donut.spawnCommands`.

Default:

```json
{
  "donut": {
    "enabled": true,
    "sendAfkCommand": true,
    "spawnCommands": ["/afk 30"],
    "commandMode": "all",
    "commandDelayMs": 2500,
    "commandJitterMs": 1500
  }
}
```

Meaning:

- `sendAfkCommand`: if `false`, spawn commands are not sent.
- `spawnCommands`: commands sent after spawn.
- `commandMode`: `all` sends every command, `randomOne` picks one command.
- `commandDelayMs`: base delay before command send.
- `commandJitterMs`: extra random delay.

Mineflayer sends commands with `bot.chat("/command")`. There is no real Minecraft
GUI chat window in Mineflayer, so the stable way is to send the command through
the normal chat API.

## Movement Before Commands

Before commands are sent, the bot can move for a few seconds.

```json
{
  "donut": {
    "preCommandMovement": {
      "enabled": true,
      "seconds": 5
    }
  }
}
```

Set `enabled` to `false` to disable it.

## Human Movement

The movement system uses Mineflayer controls and physics. It does not write
custom spoofed packets. Mineflayer and minecraft-protocol still handle movement
packets normally.

```json
{
  "humanMovement": {
    "enabled": true,
    "look": true,
    "move": true,
    "sprint": true,
    "jump": true,
    "sneak": true,
    "radiusBlocks": 4,
    "intervalMs": 1200,
    "jitterMs": 1200,
    "burstMinMs": 2500,
    "burstMaxMs": 8000,
    "stepMinMs": 450,
    "stepMaxMs": 1800,
    "stepPauseMinMs": 120,
    "stepPauseMaxMs": 700,
    "idleChance": 0.14,
    "sprintChance": 0.38,
    "strafeChance": 0.42,
    "jumpChance": 0.12,
    "sneakChance": 0.06,
    "turnMinRadians": 0.2,
    "turnMaxRadians": 1.15,
    "pitchJitterRadians": 0.16,
    "maxPitch": 0.75
  }
}
```

Simple meanings:

- `radiusBlocks`: how far the bot tries to stay from its spawn point.
- `intervalMs`: base delay between movement bursts.
- `jitterMs`: random extra delay.
- `burstMinMs` / `burstMaxMs`: how long one movement burst lasts.
- `stepMinMs` / `stepMaxMs`: how long one small movement step lasts.
- `idleChance`: chance to pause instead of moving.
- `sprintChance`: chance to sprint during a step.
- `strafeChance`: chance to move left/right while going forward.
- `jumpChance`: chance to jump.
- `sneakChance`: chance to sneak when not sprinting.
- `turnMinRadians` / `turnMaxRadians`: turn size.
- `pitchJitterRadians`: small up/down head movement.
- `maxPitch`: maximum up/down look angle.

Keep `radiusBlocks` small if the AFK zone is small.

## Basic Anti-AFK

The old simple anti-AFK feature still exists:

```json
{
  "antiAfk": {
    "enabled": true,
    "look": true,
    "jump": true,
    "sneak": true,
    "walk": false,
    "intervalMs": 18000,
    "jitterMs": 9000
  }
}
```

Leave `walk` as `false` when `humanMovement.enabled` is `true`.

## Status Log

Status log writes a small status line per bot.

```json
{
  "features": {
    "statusLog": true
  },
  "statusLog": {
    "intervalMs": 60000
  }
}
```

It logs:

- health
- food
- game mode
- dimension
- position

## Feature Switches

```json
{
  "features": {
    "chatLog": true,
    "statusLog": true,
    "autoEat": true,
    "autoArmor": true,
    "autoTool": true
  }
}
```

Meaning:

- `chatLog`: write chat and whispers to logs.
- `statusLog`: write health/food/position status lines.
- `autoEat`: use food automatically when plugin is loaded.
- `autoArmor`: equip armor automatically when plugin is loaded.
- `autoTool`: load tool plugin.

## Useful Commands

```bash
npm install
npm run dry
npm start
npm test
npm run check
npm run pack:dry
```

## Common Problems

### Cannot find package 'mineflayer'

Run:

```bash
npm install
```

Make sure you are in the folder with `package.json`.

### no_accounts

No valid account was found.

Fix:

- put account JSON files in `cookies/`, or
- create `accounts.json`

Then run:

```bash
npm run dry
```

### session_token_rejected

The server or Minecraft Services rejected the token.

Common causes:

- expired access token
- token is not a Minecraft Java token
- UUID does not match the token
- account does not own Java Edition
- refresh token is missing or expired

Fix:

1. Export a fresh Minecraft Java session.
2. Add a refresh token if your exporter gives one.
3. Run `npm run dry`.
4. Run `npm start`.

### Proxy Fails

Check:

- proxy host and port are correct
- proxy supports SOCKS4 or SOCKS5
- username/password are correct
- the proxy allows TCP connections to the Minecraft server

### Bot Walks Too Far

Lower:

```json
{
  "humanMovement": {
    "radiusBlocks": 2,
    "burstMaxMs": 4000,
    "sprintChance": 0.2
  }
}
```

## License

Read [LICENSE](LICENSE). This is a personal-use project.
