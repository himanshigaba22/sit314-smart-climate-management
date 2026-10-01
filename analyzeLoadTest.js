const mongoose = require('mongoose');
const SensorReading = require('./models/sensorReading');

const uri = "process.env.MONGODB_URI);

async function analyze(sinceMs) {
  await mongoose.connect(uri);

  const docs = await SensorReading.find({
    deviceId: { $regex: '^loadtest_sensor_' },
    sentAt: { $gte: sinceMs }
  }).lean();

  const latencies = docs
    .filter(d => d.processedAt && d.sentAt)
    .map(d => d.processedAt - d.sentAt)
    .sort((a, b) => a - b);

  const count = latencies.length;
  if (count === 0) {
    console.log('No matching documents found yet — try waiting longer for SQS/Lambda to drain.');
    await mongoose.disconnect();
    return;
  }
  const avg = latencies.reduce((a, b) => a + b, 0) / count;
  const p95 = latencies[Math.min(Math.floor(count * 0.95), count - 1)];
  const p99 = latencies[Math.min(Math.floor(count * 0.99), count - 1)];

  console.log(`Documents received: ${count}`);
  console.log(`Avg latency: ${avg.toFixed(1)} ms`);
  console.log(`P95 latency: ${p95} ms`);
  console.log(`P99 latency: ${p99} ms`);

  await mongoose.disconnect();
}

const sinceArg = parseInt(process.argv[2]);
analyze(sinceArg);
