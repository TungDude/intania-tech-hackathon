import { MongoClient } from "mongodb";

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  const globalWithMongoClient = global as typeof globalThis & {
    _mongoClientPromise: Promise<MongoClient>;
  };

  if (!globalWithMongoClient._mongoClientPromise) {
    globalWithMongoClient._mongoClientPromise = MongoClient.connect(process.env.MONGODB_URI as string);
  }
  clientPromise = globalWithMongoClient._mongoClientPromise;
} else {
  clientPromise = MongoClient.connect(process.env.MONGODB_URI as string);
}

export { clientPromise };
