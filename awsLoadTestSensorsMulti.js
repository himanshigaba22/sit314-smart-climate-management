const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');

const certsDir = path.join(__dirname, 'aws_certs');
const KEY = fs.readFileSync(path.join(certsDir, 'private-key.pem.key'));
const CERT = fs.readFileSync(path.join(certsDir, 'device-certificate.pem.crt'));
const CA = fs.readFileSync(path.join(certsDir, 'AmazonRootCA1.pem'));

const NUM_SENSORS = parseInt(process.argv[2]) || 10;
const TEST_DURATION_MS = parseInt(process.argv[3]) || 30000;
const roomId = "B201";

let totalSent = 0;
let connectedCount = 0;
const clients = [];

console.log(`Opening ${NUM_SENSORS} independent connections...`);

for (let i = 0; i < NUM_SENSORS; i++) {
    const client = mqtt.connect({
        host: 'a1iu7amqiyldcv-ats.iot.us-east-1.amazonaws.com',
        port: 8883,
        protocol: 'mqtts',
        key: KEY,
        cert: CERT,
        ca: CA,
        clientId: `loadtest_multi_${i}_${Math.random().toString(16).substr(2, 6)}`,
        reconnectPeriod: 0
    });

    client.on('connect', () => {
        connectedCount++;
        if (connectedCount === NUM_SENSORS) {
            console.log(`All ${NUM_SENSORS} connected. Starting publishing for ${TEST_DURATION_MS / 1000}s...`);
        }

        const interval = setInterval(() => {
            const reading = {
                deviceId: `loadtest_sensor_${i}`,
                room: roomId,
                type: "temperature",
                value: (Math.random() * (28 - 18) + 18).toFixed(1),
                sentAt: Date.now(),
                timestamp: new Date().toISOString()
            };
            const topic = `himanshigaba_climate/${roomId}/loadtest/${i}`;
            client.publish(topic, JSON.stringify(reading));
            totalSent++;
        }, 3000);

        setTimeout(() => {
            clearInterval(interval);
            client.end();
        }, TEST_DURATION_MS);
    });

    client.on('error', () => {});
    clients.push(client);
}

setTimeout(() => {
    console.log(`Load test finished. Total messages sent: ${totalSent}`);
    process.exit(0);
}, TEST_DURATION_MS + 5000);
