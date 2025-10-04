
import { MongoClient } from "mongodb";
import { HfInference } from "@huggingface/inference";

class SearchService {
  constructor(config) {
    this.mongoUri = config.mongoUri;
    this.dbName = config.dbName;
    this.chunkCollection = config.chunkCollection || "chunk_embeddings";
    this.articleCollection = config.articleCollection || "Articles";
    this.hfToken = config.hfToken;
    this.indexName = config.indexName || "vector_index";
  }

  async init() {
    this.client = new MongoClient(this.mongoUri);
    await this.client.connect();
    this.db = this.client.db(this.dbName);
    this.chunks = this.db.collection(this.chunkCollection);
    this.articles = this.db.collection(this.articleCollection);
    console.log("✅ Connected to MongoDB");
    this.hf = new HfInference(this.hfToken);
  }

  async getEmbedding(text) {
    const model = "sentence-transformers/all-mpnet-base-v2";
    const response = await this.hf.featureExtraction({ model, inputs: text });
    return Array.isArray(response[0]) ? response[0] : response;
  }

  async searchArticles(query, limit = 5) {
    const queryVector = await this.getEmbedding(query);

    // MongoDB $vectorSearch pipeline
    const pipeline = [
      {
        $vectorSearch: {
          index: this.indexName,
          path: "embedding",
          queryVector,
          numCandidates: 100,
          limit,
        },
      },
      {
        $lookup: {
          from: this.articleCollection,
          localField: "article_id",
          foreignField: "_id",
          as: "article_info",
        },
      },
      { $unwind: { path: "$article_info", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          text: 1,
          score: { $meta: "vectorSearchScore" },
          article_id: 1,
          article_info: 1, // 👈 project the entire article entity
        },
      },
    ];

    const results = await this.chunks.aggregate(pipeline).toArray();

    const articlesMap = new Map(); // Remove duplicates

    results.forEach((r) => {
      const articleId = r.article_id?.toString() || "N/A";
      if (!articlesMap.has(articleId)) {
        articlesMap.set(articleId, {
          ...r.article_info, // 👈 include all fields from the article
          score: r.score ?? 0,
        });
      }
    });

    // Display results
    articlesMap.forEach((article) => {
      console.log(
        `🔹 Score: ${article.score.toFixed(3)} | Article ID: ${article._id} | Title: ${article.Title}`
      );
    });

    console.log(`🔎 Full Articles Fetched: ${articlesMap.size}`);
    return Array.from(articlesMap.values());
  }
}

// ----------------------
// Example usage
// ----------------------
(async () => {
  const searchService = new SearchService({
    mongoUri:
      "",// mongodb uri
    dbName: "ArticlesDB",
    hfToken: "", // 👈 put your Hugging Face token here
  });

  await searchService.init();

  const results = await searchService.searchArticles("pelvic bone loss in space", 5);
  console.log("✅ Results:", results);
})();
