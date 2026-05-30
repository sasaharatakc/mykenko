import { PlaywrightCrawler, RequestQueue } from 'crawlee';
import { writeFileSync } from 'fs';
import { BaseCrawler, randomDelay, checkRobotsTxt } from './base.js';
import 'dotenv/config';

const BASE_URL = 'https://osakadou.cool';
const OUTPUT_PATH = new URL('../../data/osakadou-product-urls.json', import.meta.url).pathname;

// Confirmed category IDs (18 categories)
const CATEGORY_IDS = [
  639, 642, 648, 652, 654, 657, 670, 671, 675, 678,
  682, 695, 696, 700, 704, 709, 718, 730,
];

class OsakadouCrawler extends BaseCrawler {
  constructor() {
    super({ name: 'osakadou', baseUrl: BASE_URL });
    this.productUrls = new Set();
  }

  buildSeedUrls() {
    return CATEGORY_IDS.map((cid) => ({
      url: `${BASE_URL}/products/c?cid=${cid}`,
      userData: { type: 'category', cid, page: 1 },
    }));
  }

  async run() {
    const allowed = await checkRobotsTxt(BASE_URL);
    if (!allowed) {
      console.error('[osakadou] robots.txt disallows crawling. Aborting.');
      process.exit(1);
    }

    const queue = await RequestQueue.open('osakadou');
    for (const req of this.buildSeedUrls()) {
      await queue.addRequest(req);
    }

    const self = this;
    const crawler = new PlaywrightCrawler({
      ...this.buildCrawlerOptions({
        requestQueue: queue,
        async requestHandler({ request, page, enqueueLinks, log }) {
          const { type, cid, pageNum } = request.userData;
          await randomDelay();

          if (type === 'category') {
            log.info(`Crawling category cid=${cid} page=${pageNum ?? 1}: ${request.url}`);

            // Collect product links matching /detail/ pattern
            const links = await page.$$eval(
              'a[href*="/detail/"]',
              (els) => els.map((el) => el.href)
            );
            for (const link of links) {
              if (/\/detail\/\d+_/.test(link)) {
                self.productUrls.add(link);
              }
            }

            // Pagination: find next page link
            const nextPageUrl = await page.$eval(
              'a.next, a[rel="next"], .pagination a:last-child',
              (el) => el.href
            ).catch(() => null);

            if (nextPageUrl && nextPageUrl !== request.url) {
              await queue.addRequest({
                url: nextPageUrl,
                userData: { type: 'category', cid, pageNum: (pageNum ?? 1) + 1 },
              });
            }
          }
        },
        failedRequestHandler({ request, log }) {
          log.error(`Request failed: ${request.url}`);
          self.logFailed(request.url, 'max retries exceeded');
        },
      }),
    });

    await crawler.run();

    const result = [...this.productUrls].sort();
    writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2));
    console.log(`[osakadou] Saved ${result.length} product URLs → ${OUTPUT_PATH}`);

    this.saveFailedUrls(
      new URL('../../logs/osakadou-failed.json', import.meta.url).pathname
    );

    return result;
  }
}

// Direct execution
const crawler = new OsakadouCrawler();
crawler.run().catch((err) => {
  console.error('[osakadou] Fatal error:', err);
  process.exit(1);
});
