const SerpResult = require("../models/serpResult");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const puppeteer = require("puppeteer");
const NodeCache = require("node-cache");

// Cache results for 1 hour
const cache = new NodeCache({ stdTTL: 3600 });

const scrapeSerp = async (query) => {
  const browser = await puppeteer.launch({
    headless: "new", // Updated headless mode
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  try {
    // Set a realistic user agent
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    );

    // Navigate to Google with wait until
    await page.goto(
      `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      { waitUntil: "networkidle0" }
    );

    // Wait for search results to load
    await page.waitForSelector("div.g", { timeout: 5000 });

    const results = await page.evaluate(() => {
      const searchResults = [];
      // Updated selector to match Google's current structure
      const elements = document.querySelectorAll("div.g");

      elements.forEach((el, index) => {
        const titleEl = el.querySelector("h3");
        const linkEl =
          el.querySelector("div.yuRUbf > a") || el.querySelector("a");
        const snippetEl =
          el.querySelector("div.VwiC3b") || el.querySelector("div.snippet");

        if (titleEl && linkEl) {
          searchResults.push({
            title: titleEl.innerText,
            url: linkEl.href,
            description: snippetEl ? snippetEl.innerText : "",
            rank: index + 1,
          });
        }
      });

      return searchResults;
    });

    await browser.close();

    // Only cache and return if we actually got results
    if (results.length === 0) {
      throw new Error("No search results found");
    }

    return results;
  } catch (error) {
    await browser.close();
    throw error;
  }
};

exports.searchSerp = catchAsync(async (req, res, next) => {
  const { query } = req.query;

  if (!query) {
    return next(new AppError("Please provide a search query", 400));
  }

  // Check cache first
  const cachedResults = cache.get(query);
  if (cachedResults && cachedResults.length > 0) {
    return res.status(200).json({
      status: "success",
      source: "cache",
      results: cachedResults,
    });
  }

  try {
    const results = await scrapeSerp(query);

    // Save results to database
    const serpResults = await Promise.all(
      results.map((result) =>
        SerpResult.create({
          query,
          ...result,
        })
      )
    );

    // Cache the results
    if (serpResults.length > 0) {
      cache.set(query, serpResults);
    }

    res.status(200).json({
      status: "success",
      source: "fresh",
      results: serpResults,
    });
  } catch (error) {
    return next(
      new AppError(`Failed to fetch search results: ${error.message}`, 500)
    );
  }
});

exports.getSearchHistory = catchAsync(async (req, res, next) => {
  const { limit = 10, page = 1 } = req.query;

  const results = await SerpResult.find()
    .sort({ timestamp: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  res.status(200).json({
    status: "success",
    results: results.length,
    data: results,
  });
});
