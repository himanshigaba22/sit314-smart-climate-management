const mqtt = require('mqtt');
const mongoose = require('mongoose');
const SensorReading = require('./models/sensorReading');

mongoose.connect('process.env.MONGODB_URI);

const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

client.on('connect', () => {
    console.log('Storage service connected to broker');
    client.subscribe('himanshigaba_climate/#');
});

client.on('message', (topic, message) => {
    const data = JSON.parse(message.toString());
    console.log('Received:', data);

    const reading = new SensorReading({
        deviceId: data.deviceId,
        room: data.room,
        type: data.type,
        value: parseFloat(data.value),
        timestamp: new Date(data.timestamp)
    });

    reading.save().then(() => {
        console.log('Saved to MongoDB:', data.deviceId, data.type, data.value);
    }).catch(err => {
        console.log('Error saving:', err.message);
    });
});
