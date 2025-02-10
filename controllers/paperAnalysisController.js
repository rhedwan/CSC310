const { link } = require("../app");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const axios = require("axios");

// Store features and their counts
const featureDatabase = new Map();

// Define stop words to filter out
const stopWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "he",
  "in",
  "is",
  "it",
  "its",
  "of",
  "on",
  "that",
  "the",
  "to",
  "was",
  "were",
  "will",
  "with",
]);

const extractFeatures = (paper) => {
  const foundFeatures = new Set();

  // Extract features from highlights if available
  if (paper.highlighs && Array.isArray(paper.highlighs)) {
    paper.highlighs.forEach((highlight) => {
      // Clean and normalize the highlight
      const words = highlight
        .toLowerCase()
        .trim()
        .split(/\s+/) // Split by whitespace
        .filter(
          (word) => word.length > 2 && !stopWords.has(word.toLowerCase())
        ); // Filter out stop words and short words

      words.forEach((word) => {
        foundFeatures.add(word);
        // Update feature count in database
        featureDatabase.set(word, (featureDatabase.get(word) || 0) + 1);
      });
    });
  }

  return Array.from(foundFeatures);
};

exports.analyzePapers = catchAsync(async (req, res, next) => {
  const { query = "crime-reporting papers" } = req.query;

  if (!query) {
    return next(new AppError("Please provide a search query", 400));
  }

  const API_KEY = "d261a0332fcb6759fba56405f881b58d";

  const payload = {
    api_key: API_KEY,
    query,
    country_code: "NG",
    tld: "com",
  };

  try {
    const response = await axios.get(
      "https://api.scraperapi.com/structured/google/search",
      { params: payload }
    );

    const papers = response.data.organic_results;
    let allFeatures = [];

    // Clear previous feature counts
    featureDatabase.clear();

    // Process each paper
    papers.forEach((paper) => {
      const features = extractFeatures(paper);
      allFeatures = [...allFeatures, ...features];
    });

    // Count feature frequencies
    let featureCounts = Array.from(featureDatabase.entries())
      .filter(([_, count]) => count > 0) // Only include features that were found
      .sort((a, b) => b[1] - a[1]);

    // Calculate total counts for percentage normalization
    const totalCounts = featureCounts.reduce(
      (sum, [_, count]) => sum + count,
      0
    );

    // Map with normalized percentages
    featureCounts = featureCounts.map(([feature, count]) => ({
      feature,
      count,
      // Calculate normalized percentage
      percentage: Math.round((count / totalCounts) * 100),
    }));

    // Prepare visualization data
    const visualizationData = {
      labels: featureCounts.map((f) => f.feature),
      values: featureCounts.map((f) => f.count),
      percentages: featureCounts.map((f) => f.percentage),
    };

    res.status(200).json({
      status: "success",
      data: {
        totalPapersAnalyzed: papers.length,
        featureAnalysis: featureCounts,
        visualizationData,
        papers: papers.map((p) => ({
          title: p.title,
          snippet: p.snippet,
          highlights: p.highlighs || [],
          link: p.link,
        })),
      },
    });
  } catch (error) {
    return next(new AppError("Error analyzing papers: " + error.message, 500));
  }
});
