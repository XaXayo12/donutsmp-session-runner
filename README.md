# DonutSMP Session Runner

DonutSMP Session Runner is a Node.js Mineflayer bot runner. It loads Minecraft
session/account JSON files, starts one bot per account, and can run DonutSMP AFK
commands plus small anti-AFK actions.

This project is not open source for resale. See [LICENSE](LICENSE).

## What It Does

- Loads accounts from `cookies/*.json` or `accounts.json`.
- Starts one Mineflayer bot for each valid account.
- Connects the bots to the server configured in `config.json`.
- Can send `/afk 30` after spawn when DonutSMP mode is enabled.
- Can do anti-AFK actions: look, jump, sneak, and optional walking.
- Can load Mineflayer helper plugins for pathfinding, auto eat, armor, and tools.
- Saves logs in `logs/`, one file per account plus `main.log`.
- Redacts token-like fields from structured log output.
- Can auto-run `npm install` at startup when accounts exist and dependencies are missing.

## Requirements

Install this first:

- Node.js 22 or newer
- npm, which comes with Node.js

Check Node.js:

```bash
node -v
```

If it says `v22` or higher, you are fine.

## Install

Open a terminal in the project folder and run:

```bash
npm install
```

On Windows, you can also double-click:

```txt
install.bat
```

That downloads all modules from `package.json`.

## Required Modules

You do not manually download modules one by one. Run `npm install`.

The project needs these packages:

```txt
mineflayer
mineflayer-pathfinder
mineflayer-auto-eat
mineflayer-armor-manager
mineflayer-tool
```

If you see an error like this:

```txt
Cannot find package 'mineflayer'
```

it means the modules are not installed in that folder. Fix it with:

```bash
npm install
```

Then start again:

```bash
npm start
```

## Configure The Server

Open `config.json`.

The server settings are in `connection`:

```json
{
  "connection": {
    "host": "donutsmp.net",
    "port": 25565,
    "version": "1.21.11",
    "auth": "offline"
  }
}
```

What each setting means:

- `host`: server address
- `port`: server port, usually `25565`
- `version`: Minecraft version/protocol Mineflayer should use
- `auth`: default auth mode, unless an account file sets its own auth mode

The included config may use `127.0.0.1` for local testing. Change it to your real
server address before sharing or running on a real server.

## Add Accounts

Put account/session files inside the `cookies` folder:

```txt
cookies/
  account1.json
  account2.json
  account3.json
```

Example account file:

```json
{
  "profile": {
    "name": "AccountName",
    "id": "account-uuid-here"
  },
  "ygg": {
    "token": "access-token-here"
  }
}
```

You can also use one `accounts.json` file:

```json
{
  "accounts": [
    {
      "profile": {
        "name": "AccountName",
        "id": "account-uuid-here"
      },
      "ygg": {
        "token": "access-token-here"
      }
    }
  ]
}
```

The loader also understands common alternatives like `username`, `name`,
`profileName`, `accessToken`, `token`, `session.accessToken`, and
`session.selectedProfile`.

Never upload real account/session files. A token can act like account access.

## Test Account Loading

Run:

```bash
npm run dry
```

This only checks account loading. It does not start the bots.

## Start

Run:

```bash
npm start
```

On Windows, you can also double-click:

```txt
start.bat
```

## DonutSMP AFK Settings

This part controls the DonutSMP command behavior:

```json
{
  "donut": {
    "enabled": true,
    "sendAfkCommand": true,
    "spawnCommands": ["/afk 30"]
  }
}
```

Keep that enabled if you want the bot to run `/afk 30` after it spawns.

To count normal playtime without sending `/afk 30`, use:

```json
{
  "donut": {
    "enabled": true,
    "sendAfkCommand": false,
    "spawnCommands": []
  }
}
```

## Anti-AFK Settings

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

Simple meaning:

- `look`: look around a little
- `jump`: jump sometimes
- `sneak`: sneak sometimes
- `walk`: walk forward sometimes
- `intervalMs`: base delay between actions
- `jitterMs`: random extra delay

## Dependency Auto-Install

`runtime.autoInstall` controls startup dependency repair:

```json
{
  "runtime": {
    "autoInstall": true
  }
}
```

When this is `true`, the app tries to run `npm install` if accounts exist and a
required Mineflayer package is missing.

Even with this enabled, the cleanest setup is still:

```bash
npm install
```

before running the bot.

## Logs

Logs are saved in `logs/`.

Example:

```txt
logs/
  main.log
  AccountName.log
```

Log files are ignored by Git.

## Safe Files And Secret Files

Do not upload:

- `cookies/*.json`
- `accounts.json`
- `.env`
- `profiles/`
- `logs/`

The `.gitignore` is set up to keep those files out of the repo.

## Useful Commands

```bash
npm install
npm run dry
npm start
npm run check
```

## Quick Reply For Module Errors

Send this to someone who gets a module error:

```txt
You do not need to download modules manually. Open the project folder in a terminal and run:

npm install

That installs mineflayer and the other required packages from package.json.
After that, run:

npm run dry
npm start

If it says "Cannot find package 'mineflayer'", you skipped npm install or ran it in the wrong folder.
```

## License

This project is released under a custom personal-use license. You may use it for
personal/non-commercial use, but you may not sell it, resell it, rebrand it,
rent access to it, or redistribute paid copies. See [LICENSE](LICENSE).
