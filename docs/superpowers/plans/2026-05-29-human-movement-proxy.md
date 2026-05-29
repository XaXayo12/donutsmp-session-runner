# Human Movement And Proxy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build configurable per-bot proxy, command, chat, and natural movement features for the Mineflayer runner.

**Architecture:** Keep the current small-module structure. Add pure helpers for config/proxy/movement so behavior is testable without connecting to Minecraft, then wire them into `BotRunner` and features.

**Tech Stack:** Node.js 22 ESM, Mineflayer, minecraft-protocol, `socks`, built-in `node:test`.

---

### Task 1: Test Harness

**Files:**
- Modify: `package.json`
- Create: `test/config.test.js`
- Create: `test/proxy.test.js`
- Create: `test/humanMovement.test.js`

- [ ] Add `npm test` using `node --test`.
- [ ] Write failing tests that import the new helpers.
- [ ] Run `npm test` and confirm missing modules fail.

### Task 2: Per-Bot Config

**Files:**
- Create: `src/bot/effectiveConfig.js`
- Modify: `src/bot/BotRunner.js`
- Modify: `src/config/defaultConfig.js`
- Modify: `src/config/normalizeConfig.js`

- [ ] Implement safe deep merge where account overrides replace arrays.
- [ ] Normalize new `humanMovement` and `network` settings.
- [ ] Give each `BotRunner` an effective config.

### Task 3: Proxy Support

**Files:**
- Create: `src/network/proxy.js`
- Modify: `src/bot/createBotInstance.js`
- Modify: `src/accounts/normalizeAccounts.js`
- Modify: `package.json`

- [ ] Parse named proxy objects and proxy URLs.
- [ ] Support SOCKS4 and SOCKS5 with optional username/password.
- [ ] Add the Mineflayer `connect` hook only when a bot has a proxy.

### Task 4: Movement Feature

**Files:**
- Create: `src/features/humanMovement.js`
- Modify: `src/features/attachFeatures.js`
- Modify: `src/features/antiAfk.js`
- Modify: `src/features/donut.js`

- [ ] Generate random movement steps inside a configurable radius.
- [ ] Use Mineflayer controls for forward/back/left/right/sprint/jump/sneak.
- [ ] Use gradual `bot.look` calls with head jitter.
- [ ] Run optional pre-command movement before spawn commands.

### Task 5: Documentation And Release Prep

**Files:**
- Modify: `README.md`
- Modify: `config.json`
- Modify: `package.json`

- [ ] Rewrite README in beginner-friendly French/English-simple style.
- [ ] Document every important configurable field.
- [ ] Bump version for release.

### Task 6: Verification And Publish

**Commands:**
- `npm test`
- `npm run check`
- `npm run dry`
- `npm run pack:dry`
- `git status --short`
- `git add ...`
- `git commit ...`
- `git tag ...`
- `git push origin main --tags`
- `gh release create ...`

- [ ] Run all verification commands and read outputs.
- [ ] Commit only intended files.
- [ ] Push main and tags.
- [ ] Create a GitHub release with a concise changelog.
