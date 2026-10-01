const mqtt = require('mqtt');

const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

const NUM_SENSORS = parseInt(process.argv[2]) || 10;
const roomId = "B201";

let messagesSent = 0;

client.on('connect', () => {
    console.log(`Load test started: simulating ${NUM_SENSORS} sensors`);

    setInterval(function () {
        for (let i = 0; i < NUM_SENSORS; i++) {
            const reading = {
                deviceId: `loadtest_sensor_${i}`,
                room: roomId,
                type: "temperature",
                value: (Math.random() * (28 - 18) + 18).toFixed(1),
                sentAt: Date.now()
            };

            const topic = `himanshigaba_climate/${roomId}/loadtest/${i}`;
            client.publish(topic, JSON.stringify(reading));
            messagesSent++;
        }
        console.log(`Published batch. Total messages sent so far: ${messagesSent}`);
    }, 3000);
});