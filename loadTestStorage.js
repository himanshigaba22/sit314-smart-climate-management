const mqtt = require('mqtt');
const mongoose = require('mongoose');
const SensorReading = require('./models/sensorReading');

mongoose.connect('process.env.MONGODB_URI);ø

const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

let messagesReceived = 0;
let messagesSaved = 0;
let messagesFailed = 0;
let latencies = [];
let testStartTime = Date.now();

client.on('connect', () => {
    console.log('Load test storage service connected to broker');
    client.subscribe('himanshigaba_climate/B201/loadtest/#');
});

client.on('message', (topic, message) => {
    messagesReceived++;
    const data = JSON.parse(message.toString());

    const latency = Date.now() - data.sentAt;
    latencies.push(latency);

    const reading = new SensorReading({
        deviceId: data.deviceId,
        room: data.room,
        type: data.type,
        value: parseFloat(data.value),
        timestamp: new Date()
    });

    reading.save().then(() => {
        messagesSaved++;
    }).catch(err => {
        messagesFailed++;
    });
});

setInterval(function () {
    const elapsedSeconds = (Date.now() - testStartTime) / 1000;
    const throughput = (messagesReceived / elapsedSeconds).toFixed(2);

    let sortedLatencies = [...latencies].sort((a, b) => a - b);
    let p95 = sortedLatencies.length > 0 ? sortedLatencies[Math.floor(sortedLatencies.length * 0.95)] : 0;
    let p99 = sortedLatencies.length > 0 ? sortedLatencies[Math.floor(sortedLatencies.length * 0.99)] : 0;
    let median = sortedLatencies.length > 0 ? sortedLatencies[Math.floor(sortedLatencies.length * 0.5)] : 0;

    console.log('--- Performance Report ---');
    console.log(`Elapsed time: ${elapsedSeconds.toFixed(1)}s`);
    console.log(`Messages received: ${messagesReceived}`);
    console.log(`Messages saved: ${messagesSaved}`);
    console.log(`Messages failed: ${messagesFailed}`);
    console.log(`Throughput: ${throughput} msg/sec`);
    console.log(`Median latency: ${median}ms`);
    console.log(`p95 latency: ${p95}ms`);
    console.log(`p99 latency: ${p99}ms`);
    console.log('---------------------------');
}, 10000); // report every 10 seconds
