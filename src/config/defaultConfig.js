export const defaultConfig = {
  connection: {
    host: '127.0.0.1',
    port: 25565,
    version: '1.21.11',
    auth: 'offline',
    brand: 'vanilla',
    profilesFolder: './profiles',
    checkTimeoutInterval: 30000,
    physicsEnabled: true,
    respawn: true,
    hideErrors: false,
    logErrors: false
  },
  accounts: {
    cookiesDir: './cookies',
    accountsFile: './accounts.json',
    recursive: true,
    strict: false,
    maxFiles: 256
  },
  network: {
    proxy: null,
    proxies: {}
  },
  runtime: {
    joinDelayMs: 3500,
    spawnTimeoutMs: 45000,
    maxReconnects: 0,
    reconnectBaseMs: 5000,
    reconnectMaxMs: 60000,
    autoInstall: true
  },
  donut: {
    enabled: true,
    sendAfkCommand: true,
    spawnCommands: ['/afk 30'],
    commandMode: 'all',
    commandDelayMs: 2500,
    commandJitterMs: 1500,
    preCommandMovement: {
      enabled: true,
      seconds: 5
    },
    periodicCommands: [],
    periodicCommandIntervalMs: 600000
  },
  antiAfk: {
    enabled: true,
    look: true,
    jump: true,
    sneak: true,
    walk: false,
    intervalMs: 18000,
    jitterMs: 9000
  },
  humanMovement: {
    enabled: true,
    look: true,
    move: true,
    sprint: true,
    jump: true,
    sneak: true,
    radiusBlocks: 4,
    intervalMs: 1200,
    jitterMs: 1200,
    burstMinMs: 2500,
    burstMaxMs: 8000,
    stepMinMs: 450,
    stepMaxMs: 1800,
    stepPauseMinMs: 120,
    stepPauseMaxMs: 700,
    idleChance: 0.14,
    sprintChance: 0.38,
    strafeChance: 0.42,
    jumpChance: 0.12,
    sneakChance: 0.06,
    turnMinRadians: 0.2,
    turnMaxRadians: 1.15,
    pitchJitterRadians: 0.16,
    maxPitch: 0.75
  },
  plugins: {
    loadInternal: true,
    internalOverrides: {
      physics: true,
      velocity: true,
      ray_trace: true
    },
    external: {
      pathfinder: true,
      autoEat: true,
      armorManager: true,
      tool: true
    }
  },
  features: {
    chatLog: true,
    statusLog: false,
    autoEat: true,
    autoArmor: true,
    autoTool: true
  },
  statusLog: {
    intervalMs: 60000
  },
  logging: {
    dir: './logs',
    console: true
  }
}
