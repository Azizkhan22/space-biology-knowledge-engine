import pymongo
from pymongo.errors import PyMongoError
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()

# Get the MongoDB URI from .env
MONGO_URI = os.getenv("MONGO_URI")


try:
    print("🔗 Connecting to MongoDB Atlas...")
    client = pymongo.MongoClient(MONGO_URI)
    db = client["ArticlesDB"]
    collection = db["Articles"]

    print("✅ Connected successfully!")

    # Show how many docs before update
    initial_count = collection.count_documents({})
    print(f"📄 Found {initial_count} documents in 'articles' collection.")

    # Update all docs to include an empty embedding field
    result = collection.update_many({}, {"$set": {"embedding": []}})

    print("⚙️ Running update...")
    print(f"➡️ Matched: {result.matched_count}")
    print(f"✅ Modified: {result.modified_count}")

    # Verify by fetching one document
    sample_doc = collection.find_one({}, {"Title": 1, "embedding": 1})
    print("🔍 Sample updated document:")
    print(sample_doc)

except PyMongoError as e:
    print("❌ MongoDB Error:", e)
except Exception as ex:
    print("❌ General Error:", ex)
