const mqtt = require('mqtt');

const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

const roomId = "B201";
const topic = `himanshigaba_climate/${roomId}/humidity`;

client.on('connect', () => {
    console.log('Humidity sensor connected to broker');

    setInterval(function () {
        const reading = {
            deviceId: "sensor102",
            room: roomId,
            type: "humidity",
            value: (Math.random() * (70 - 30) + 30).toFixed(1),
            timestamp: new Date().toISOString()
        };

        client.publish(topic, JSON.stringify(reading));
        console.log('Published:', JSON.stringify(reading));
    }, 3000);
});