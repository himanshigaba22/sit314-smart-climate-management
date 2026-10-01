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
    clientId: 'temperatureSensorClient_' + Math.random().toString(16).substr(2, 8)
};

const client = mqtt.connect(options);
client.on('packetreceive', (packet) => {
    console.log('Packet received:', JSON.stringify(packet));
});

client.on('packetsend', (packet) => {
    console.log('Packet sent:', JSON.stringify(packet));
});
const roomId = "B201";
const topic = `himanshigaba_climate/${roomId}/temperature`;

client.on('connect', () => {
    console.log('Connected to AWS IoT Core');
    setInterval(function () {
        const reading = {
            deviceId: "sensor101",
            room: roomId,
            type: "temperature",
            value: (Math.random() * (28 - 18) + 18).toFixed(1),
            timestamp: new Date().toISOString()
        };
        client.publish(topic, JSON.stringify(reading));
        console.log('Published:', reading);
    }, 3000);
});

client.on('error', (err) => {
    console.error('Connection error:', err);
});

client.on('reconnect', () => {
    console.log('Reconnecting...');
});

client.on('offline', () => {
    console.log('Client is offline');
});

client.on('close', () => {
    console.log('Connection closed');
});
