import clientPromise from "@/lib/mongodb";
import { m_restaurants } from "@/data/mockRestaurants";
import { Restaurant } from "@/types/restaurant";

// Runs with "npm run seed"
async function seedDatabase() {
  console.log("Connecting to MongoDB...");

  try {
    const client = await clientPromise;
    const db = client.db();

    // Pass the imported interface to the collection method
    const collection = db.collection<Restaurant>("restaurants");

    console.log("Clearing existing restaurants...");
    await collection.deleteMany({});

    console.log(`Inserting ${m_restaurants.length} restaurants from separate data/type files...`);
    const result = await collection.insertMany(m_restaurants);

    console.log(`Successfully seeded database! Inserted ${result.insertedCount} documents.`);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the script
seedDatabase();
