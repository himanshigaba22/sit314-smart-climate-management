const mqtt = require('mqtt');

const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

const roomId = "B201";
const topic = `himanshigaba_climate/${roomId}/temperature`;

client.on('connect', () => {
    console.log('Temperature sensor connected to broker');

    setInterval(function () {
        const reading = {
            deviceId: "sensor101",
            room: roomId,
            type: "temperature",
            value: (Math.random() * (28 - 18) + 18).toFixed(1),
            timestamp: new Date().toISOString()
        };

        client.publish(topic, JSON.stringify(reading));
        console.log('Published:', JSON.stringify(reading));
    }, 3000); // every 3 seconds
});