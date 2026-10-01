const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

let cachedClient = null;

async function getClient() {
  if (cachedClient) {
    return cachedClient;
  }
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

exports.handler = async (event) => {
  const client = await getClient();
  const db = client.db("smart_climate");
  const collection = db.collection("sensorreadings");

  const results = [];

  for (const record of event.Records) {
    try {
      const body = JSON.parse(record.body);

      const doc = {
        deviceId: body.deviceId,
        room: body.room,
        type: body.type,
        value: body.value !== undefined ? Number(body.value) : undefined,
        timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
        sentAt: body.sentAt !== undefined ? Number(body.sentAt) : undefined,
        processedAt: Date.now()
      };

      await collection.insertOne(doc);
      results.push({ status: "saved", deviceId: body.deviceId });
    } catch (err) {
      console.error("Failed to process record:", err, record.body);
      results.push({ status: "error", error: err.message });
    }
  }

  console.log("Processed", results.length, "messages");
  return { batchItemsProcessed: results.length };
};
