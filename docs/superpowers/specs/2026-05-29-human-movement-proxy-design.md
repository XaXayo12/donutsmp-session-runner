# Human Movement And Proxy Design

## Goal

Add configurable per-bot network and behavior settings while keeping movement inside the normal Mineflayer physics and packet path.

## Boundaries

The project will not add packet spoofing, anti-cheat bypasses, or admin-evasion behavior. Movement uses Mineflayer controls (`setControlState`, `look`, physics ticks), so Minecraft protocol packets continue to be produced by the Mineflayer physics plugin and the selected fork.

## Features

- Per-bot config overrides for chat logging, Donut commands, anti-AFK, human movement, and proxy.
- SOCKS proxy support per bot using Mineflayer's documented `connect` hook and the `socks` package.
- Human movement loop with random walks, sprint bursts, turns, head movement, idle pauses, jumps, sneak taps, and radius limits.
- Pre-command movement delay in seconds before spawn commands are sent.
- Command selection stays configurable through `donut.spawnCommands`; `/afk 30` remains only the default.
- README rewritten with beginner-friendly install, config, account, proxy, movement, command, and troubleshooting sections.

## Architecture

- `src/bot/effectiveConfig.js` merges global config with account-level overrides.
- `src/network/proxy.js` parses proxy definitions and creates a Mineflayer `connect` function for SOCKS proxies.
- `src/features/humanMovement.js` owns movement scheduling and only calls Mineflayer public APIs.
- Existing `donut`, `chatLog`, and `BotRunner` modules use the effective per-bot config.

## Testing

Use Node's built-in `node:test` runner for pure logic:

- config merging and array replacement
- proxy parsing and option shaping
- human movement plan generation staying within expected bounds
- config normalization for new numeric and boolean settings

Runtime verification remains `npm run check`, `npm test`, `npm run dry`, and `npm run pack:dry`.
