const mongoose = require("mongoose");

const serpResultSchema = new mongoose.Schema(
  {
    query: {
      type: String,
      required: [true, "Search query is required"],
      index: true
    },
    title: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    description: String,
    rank: Number,
    features: [{
      type: String,
      enum: ['featured_snippet', 'knowledge_graph', 'people_also_ask', 'related_searches']
    }],
    analysisData: {
      keywordDensity: Number,
      contentLength: Number,
      readabilityScore: Number
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

const SerpResult = mongoose.model("SerpResult", serpResultSchema);

module.exports = SerpResult;