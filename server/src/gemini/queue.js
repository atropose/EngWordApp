import { config } from '../config.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const isRetryable = (err) => {
  const msg = `${err?.message || ''} ${err?.status || ''} ${err?.code || ''}`.toLowerCase();
  return msg.includes('429') || msg.includes('resource_exhausted') || msg.includes('rate') || msg.includes('unavailable') || msg.includes('timeout') || msg.includes('500') || msg.includes('503');
};

class GeminiQueue {
  constructor() {
    this.chain = Promise.resolve();
    this.lastRun = 0;
  }

  async _throttleWait() {
    const elapsed = Date.now() - this.lastRun;
    const waitMs = Math.max(0, config.throttle.delayMs - elapsed);
    if (waitMs > 0) await sleep(waitMs);
    this.lastRun = Date.now();
  }

  run(taskFn) {
    const wrapped = async () => {
      for (let attempt = 0; attempt <= config.throttle.maxRetries; attempt += 1) {
        await this._throttleWait();
        try {
          return await taskFn();
        } catch (err) {
          if (!isRetryable(err) || attempt >= config.throttle.maxRetries) throw err;
          const exp = Math.min(config.throttle.maxBackoffMs, config.throttle.baseBackoffMs * (2 ** attempt));
          const jitter = Math.floor(Math.random() * (config.throttle.jitterMs + 1));
          await sleep(exp + jitter);
        }
      }
      throw new Error('Queue retry exhausted');
    };

    const runPromise = this.chain.then(wrapped, wrapped);
    this.chain = runPromise.catch(() => {});
    return runPromise;
  }
}

export const geminiQueue = new GeminiQueue();
