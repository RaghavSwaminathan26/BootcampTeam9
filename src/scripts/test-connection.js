// scripts/test-connection.js
// Run with: node scripts/test-connection.js
// Verifies your .env.local MONGODB_URI actually connects, using the same
// native MongoDB driver this project's src/lib/mongodb.ts is built on.

require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("❌ MONGODB_URI is not set. Check that .env.local exists in the project root and contains it.");
  process.exit(1);
}

const client = new MongoClient(uri);

async function main() {
  try {
    await client.connect();
    await client.db().command({ ping: 1 });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();
