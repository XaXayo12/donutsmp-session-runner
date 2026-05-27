# DonutSMP Session Runner

DonutSMP Session Runner starts Minecraft bots with Mineflayer. It reads your own
account/session JSON files, connects one bot per account, can send `/afk 30`,
and can run simple anti-AFK actions.

This is a personal-use project. You may not sell it, resell it, rebrand it, or
sell access to it. Read [LICENSE](LICENSE).

## Read This First

- Only use accounts you own or are allowed to use.
- Do not send your token/session files to random people.
- Do not upload `cookies/*.json` or `accounts.json`.
- A token/session file can act like account access.
- Use this only on servers where this kind of automation is allowed.

## What The Bot Does

The app does this:

1. Opens `config.json`.
2. Looks for account files in `cookies/`.
3. If `cookies/` is empty, it looks for `accounts.json`.
4. Checks which accounts are valid.
5. Starts one Mineflayer bot per account.
6. Loads optional plugins: pathfinder, auto eat, armor manager, and tool.
7. Runs DonutSMP commands like `/afk 30` if enabled.
8. Runs anti-AFK actions if enabled.
9. Writes logs in `logs/`.

## Step 1: Install Node.js

Install Node.js 22 or newer.

Check it:

```bash
node -v
```

Good:

```txt
v22.0.0
v23.0.0
v24.0.0
```

Bad:

```txt
v18.x
v20.x
```

This project uses a Mineflayer build that depends on packages requiring Node 22.

## Step 2: Open The Project Folder

Open a terminal in the folder that contains `package.json`.

Example on Windows:

```powershell
cd "C:\Users\YourName\Downloads\donutsmp-session-runner"
```

If you run commands in the wrong folder, modules and config will not be found.

If your extracted folder has a random name, rename it to:

```txt
donutsmp-session-runner
```

## Step 3: Install Modules

Run:

```bash
npm install
```

Windows users can also double-click:

```txt
install.bat
```

Do not download modules manually. `npm install` reads `package.json` and installs
everything.

The important modules are:

```txt
mineflayer
mineflayer-pathfinder
mineflayer-auto-eat
mineflayer-armor-manager
mineflayer-tool
```

If you see this:

```txt
Cannot find package 'mineflayer'
```

you skipped `npm install` or ran it in the wrong folder.

## Step 4: Choose The Server IP, Port, And Version

Open `config.json`.

Find this part:

```json
{
  "connection": {
    "host": "127.0.0.1",
    "port": 25565,
    "version": "1.21.11",
    "auth": "offline"
  }
}
```

### For DonutSMP

Use:

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

### For another server

Change only these:

```json
{
  "connection": {
    "host": "server-ip-here",
    "port": 25565,
    "version": "minecraft-version-here"
  }
}
```

What the words mean:

- `host`: the server IP or domain, like `donutsmp.net`
- `port`: the server port, usually `25565`
- `version`: the Minecraft version the server uses
- `auth`: the fallback auth mode when an account file does not provide a session

If you do not know the port, try `25565`.

If you do not know the version, check the server list in Minecraft or the server
Discord. The version in `config.json` should match the version the server accepts.

## Step 5: Add Your Accounts

You have two options.

### Option A: Use The Cookies Folder

Put JSON files in `cookies/`.

Example:

```txt
cookies/
  account1.json
  account2.json
  account3.json
```

Each file can look like this:

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

### Option B: Use accounts.json

Create `accounts.json` in the project folder:

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

Use `accounts.json` if you want all accounts in one file.

Use `cookies/` if you want one file per account.

## Step 6: Check If Accounts Load

Run:

```bash
npm run dry
```

This does not connect to the server. It only checks account loading.

Good output looks like:

```txt
INFO main dry {"accounts":[{"name":"AccountName","source":"./accounts.json","session":"[redacted]"}]}
```

If it says:

```txt
WARN main no_accounts
```

then no valid accounts were found.

Check:

- your file is named `accounts.json`, or your files are inside `cookies/`
- your JSON is valid
- the account name is 3 to 16 characters
- the UUID is real and not empty
- the token field exists

## Step 7: Start The Bots

Run:

```bash
npm start
```

Windows users can also double-click:

```txt
start.bat
```

`npm start` runs a syntax check first. If the JavaScript is broken, it stops
before connecting accounts.

## DonutSMP AFK Setup

In `config.json`, this controls `/afk 30`:

```json
{
  "donut": {
    "enabled": true,
    "sendAfkCommand": true,
    "spawnCommands": ["/afk 30"]
  }
}
```

Keep it like that if you want the bot to send `/afk 30`.

If you want normal playtime without `/afk 30`, use:

```json
{
  "donut": {
    "enabled": true,
    "sendAfkCommand": false,
    "spawnCommands": []
  }
}
```

## Anti-AFK Setup

In `config.json`:

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

Meaning:

- `look`: look around
- `jump`: jump sometimes
- `sneak`: sneak sometimes
- `walk`: walk forward sometimes
- `intervalMs`: base delay between actions
- `jitterMs`: random extra delay

Leave `walk` as `false` unless you know what you are doing.

## Logs

Logs go in `logs/`.

Example:

```txt
logs/
  main.log
  AccountName.log
```

Logs are ignored by Git.

## Common Problems

### Cannot find package 'mineflayer'

Run:

```bash
npm install
```

Make sure you are in the folder with `package.json`.

### Microsoft asks for a browser code

If you added token/session files and Microsoft still asks for a code, update the
project. Session files should be used directly and should not force a new
Microsoft device login.

Also check that your account file has:

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

### autoEat says plugin_invalid

Update the project and run:

```bash
npm install
```

The project uses `mineflayer-auto-eat` through its `loader` export.

### no_accounts

The app did not find any valid accounts.

Fix:

```txt
cookies/account1.json
```

or:

```txt
accounts.json
```

Then run:

```bash
npm run dry
```

### Wrong server version

Change:

```json
{
  "connection": {
    "version": "1.21.11"
  }
}
```

Use the version the server accepts.

## Useful Commands

Install:

```bash
npm install
```

Check accounts:

```bash
npm run dry
```

Start:

```bash
npm start
```

Check JavaScript syntax:

```bash
npm run check
```

## What To Send Someone Who Has A Module Error

```txt
Open the project folder in a terminal and run:

npm install

Do not download modules one by one. npm install reads package.json and installs everything.

Then test:

npm run dry

Then start:

npm start

If it says "Cannot find package 'mineflayer'", you are either in the wrong folder or you skipped npm install.
```

## Secret Files

Never upload these:

```txt
cookies/*.json
accounts.json
.env
profiles/
logs/
```

The `.gitignore` is set up to keep them out of GitHub.
