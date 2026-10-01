const mqtt = require('mqtt');

const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

client.on('connect', () => {
    console.log('Subscriber connected');
    client.subscribe('himanshigaba_climate/#');
});

client.on('message', (topic, message) => {
    console.log('Received on', topic, ':', message.toString());
});