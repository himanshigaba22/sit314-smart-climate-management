const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');

const certsDir = path.join(__dirname, 'aws_certs');

const options = {
    host: 'a1iu7amqiyldcv-ats.iot.us-east-1.amazonaws.com',
    port: 8883,
    protocol: 'mqtts',
    key: fs.readFileSync(path.join(certsDir, 'private-key.pem.key')),
    cert: fs.readFileSync(path.join(certsDir, 'device-certificate.pem.crt')),
    ca: fs.readFileSync(path.join(certsDir, 'AmazonRootCA1.pem')),
    clientId: 'loadTestClient_' + Math.random().toString(16).substr(2, 8)
};

const client = mqtt.connect(options);

const NUM_SENSORS = parseInt(process.argv[2]) || 10;
const TEST_DURATION_MS = parseInt(process.argv[3]) || 60000;
const roomId = "B201";

let messagesSent = 0;
let intervalHandle;

client.on('connect', () => {
    console.log(`Connected to AWS IoT Core. Starting load test with ${NUM_SENSORS} sensors for ${TEST_DURATION_MS / 1000}s...`);

    intervalHandle = setInterval(function () {
        for (let i = 0; i < NUM_SENSORS; i++) {
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
            messagesSent++;
        }
    }, 3000);

    setTimeout(() => {
        clearInterval(intervalHandle);
        console.log(`Load test finished. Total messages sent: ${messagesSent}`);
        client.end();
        process.exit(0);
    }, TEST_DURATION_MS);
});

client.on('error', (err) => {
    console.error('Connection error:', err);
});
