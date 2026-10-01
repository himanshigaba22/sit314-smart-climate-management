const mqtt = require('mqtt');

const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

const roomId = "B201";
const topic = `himanshigaba_climate/${roomId}/occupancy`;

client.on('connect', () => {
    console.log('Occupancy sensor connected to broker');

    setInterval(function () {
        const reading = {
            deviceId: "sensor103",
            room: roomId,
            type: "occupancy",
            value: Math.floor(Math.random() * (25 - 0) + 0),
            timestamp: new Date().toISOString()
        };

        client.publish(topic, JSON.stringify(reading));
        console.log('Published:', JSON.stringify(reading));
    }, 3000);
});