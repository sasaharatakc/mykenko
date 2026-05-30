import { PlaywrightCrawler, RequestQueue } from 'crawlee';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import 'dotenv/config';

const DELAY_MIN = parseInt(process.env.REQUEST_DELAY_MIN ?? '1000');
const DELAY_MAX = parseInt(process.env.REQUEST_DELAY_MAX ?? '3000');

export function randomDelay(min = DELAY_MIN, max = DELAY_MAX) {
  return new Promise((resolve) =>
    setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min)
  );
}

export async function checkRobotsTxt(baseUrl) {
  try {
    const res = await fetch(`${baseUrl}/robots.txt`);
    if (!res.ok) return true;
    const text = await res.text();
    const lines = text.split('\n');
    let inUserAgentAll = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (/^user-agent:\s*\*/i.test(trimmed)) {
        inUserAgentAll = true;
        continue;
      }
      if (/^user-agent:/i.test(trimmed)) {
        inUserAgentAll = false;
        continue;
      }
      if (inUserAgentAll && /^disallow:\s*\/$/i.test(trimmed)) {
        console.warn(`[robots.txt] ${baseUrl} disallows all crawlers`);
        return false;
      }
    }
    return true;
  } catch {
    return true;
  }
}

export class BaseCrawler {
  constructor(options = {}) {
    this.name = options.name ?? 'base';
    this.baseUrl = options.baseUrl ?? '';
    this.failedUrls = [];
    this.chromiumPath = process.env.CHROMIUM_PATH ?? undefined;
  }

  logFailed(url, reason) {
    this.failedUrls.push({ url, reason, at: new Date().toISOString() });
  }

  saveFailedUrls(outputPath) {
    if (this.failedUrls.length > 0) {
      writeFileSync(outputPath, JSON.stringify(this.failedUrls, null, 2));
      console.log(`[${this.name}] Failed URLs saved: ${outputPath}`);
    }
  }

  buildCrawlerOptions(handlers) {
    return {
      launchContext: {
        launchOptions: {
          ...(this.chromiumPath ? { executablePath: this.chromiumPath } : {}),
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
      },
      maxRequestRetries: 2,
      requestHandlerTimeoutSecs: 30,
      ...handlers,
    };
  }

  async run() {
    throw new Error('run() must be implemented by subclass');
  }
}
