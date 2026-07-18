const { MongoClient, ObjectId } = require('mongodb');
const { HfInference } = require('@huggingface/inference');
require('dotenv').config
class SearchService {
  constructor(config = {}) {
    this.mongoUri = config.mongoUri || process.env.MONGODB_URI;
    this.dbName = config.dbName || process.env.DB_NAME;
    this.chunkCollection = config.chunkCollection || "chunk_embeddings";
    this.articleCollection = config.articleCollection || "Articles";
    this.hfToken = config.hfToken || process.env.HUGGINGFACE_TOKEN;
    this.indexName = config.indexName || "vector_index";
    this._ready = null; // memoized connection promise
  }

  // Connect once and reuse. Every caller awaits the same promise, so a search
  // never re-opens the database — it reuses the already-open connection pool.
  init() {
    if (this._ready) return this._ready;

    this._ready = (async () => {
      this.client = new MongoClient(this.mongoUri, {
        maxPoolSize: 10,
        minPoolSize: 1, // keep a connection warm so idle searches don't cold-reconnect
        serverSelectionTimeoutMS: 10000,
      });
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      this.chunks = this.db.collection(this.chunkCollection);
      this.articles = this.db.collection(this.articleCollection);
      this.hf = new HfInference(this.hfToken);
      console.log("✅ [SearchService] Connected to MongoDB (pooled connection, reused across searches)");
    })().catch((err) => {
      this._ready = null; // allow a retry on the next request if this attempt failed
      throw err;
    });

    return this._ready;
  }

  async getEmbedding(text) {
    const model = "sentence-transformers/all-mpnet-base-v2";
    // Pin the provider so the client goes straight to HF Inference instead of
    // making an extra "auto provider" lookup call to huggingface.co on every
    // request (an extra round-trip and an extra point of failure).
    const response = await this.hf.featureExtraction({
      model,
      inputs: text,
      provider: "hf-inference",
    });
    return Array.isArray(response[0]) ? response[0] : response;
  }

  async searchArticles(query, limit = 24) {
    await this.init(); // no-op after the first connect; reuses the open pool
    const queryVector = await this.getEmbedding(query);

    // Pull a few chunks per desired article, then dedupe to articles.
    // We deliberately keep numCandidates modest: an oversized candidate pool
    // is the main cause of slow $vectorSearch, and a $lookup inside the vector
    // pipeline is pathologically slow — so we fetch article docs separately.
    const chunkLimit = Math.min(Math.max(limit * 3, 30), 90);
    const numCandidates = Math.min(chunkLimit * 10, 300);

    const chunks = await this.chunks
      .aggregate([
        {
          $vectorSearch: {
            index: this.indexName,
            path: "embedding",
            queryVector,
            numCandidates,
            limit: chunkLimit,
          },
        },
        {
          $project: {
            _id: 0,
            score: { $meta: "vectorSearchScore" },
            article_id: 1,
          },
        },
      ])
      .toArray();

    // Keep the best (first-seen = highest-scoring) chunk per article, in order.
    const scoreByArticle = new Map();
    for (const c of chunks) {
      const id = c.article_id?.toString();
      if (id && !scoreByArticle.has(id)) scoreByArticle.set(id, c.score ?? 0);
    }

    const orderedIds = [...scoreByArticle.keys()].slice(0, limit);
    if (orderedIds.length === 0) return [];

    // Fetch the matching article documents in a single query (no per-row join).
    const objectIds = orderedIds.map((id) => {
      try {
        return new ObjectId(id);
      } catch {
        return id;
      }
    });
    const docs = await this.articles.find({ _id: { $in: objectIds } }).toArray();
    const docById = new Map(docs.map((d) => [d._id.toString(), d]));

    // Return articles in relevance order, with the search score attached.
    const results = orderedIds
      .map((id) => {
        const doc = docById.get(id);
        return doc ? { ...doc, score: scoreByArticle.get(id) } : null;
      })
      .filter(Boolean);

    console.log(`🔎 Search "${query}" → ${results.length} articles (${chunks.length} chunks scanned)`);
    return results;
  }
  // ... rest of your SearchService implementation ...
}

module.exports = SearchService;