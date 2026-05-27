export class DisposableScope {
  constructor () {
    this.items = []
    this.closed = false
  }

  add (dispose) {
    if (this.closed) {
      safe(dispose)
      return dispose
    }

    this.items.push(dispose)
    return dispose
  }

  timeout (callback, ms) {
    const timer = setTimeout(callback, Math.max(0, ms))
    timer.unref?.()
    this.add(() => clearTimeout(timer))
    return timer
  }

  interval (callback, ms) {
    const timer = setInterval(callback, Math.max(1, ms))
    timer.unref?.()
    this.add(() => clearInterval(timer))
    return timer
  }

  close () {
    if (this.closed) return

    this.closed = true

    for (const dispose of this.items.reverse()) {
      safe(dispose)
    }

    this.items = []
  }
}

function safe (dispose) {
  try {
    if (typeof dispose === 'function') dispose()
  } catch {}
}
