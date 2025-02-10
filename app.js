const express = require("express");
const app = express();
const sensorRoute = require("./router/sensorRoute");
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");
const globalErrorHandler = require("./controllers/errorController");
const mqtt = require("mqtt");
const SensorReadings = require("./models/sensorReading");
const dotenv = require("dotenv");
const paperAnalysisRoute = require("./routes/paperAnalysisRoute");

dotenv.config({ path: "./config.env" });

app.use(morgan("dev"));

app.use(express.json());
app.use(cors());
app.use(compression());
app.use(morgan("dev"));

app.use("/api/papers", paperAnalysisRoute);

app.get("/", (req, res) => {
  res.send("Hello to Clmides API");
});

// MQTT Client Setup
const mqttOptions = {
  host: process.env.MQTT_HOST,
  port: 8883,
  protocol: "mqtts",
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
};

const client = mqtt.connect(mqttOptions);

client.on("connect", () => {
  console.log("Subscriber connected to MQTT broker");

  // Subscribe to specific Climdes topic pattern
  const topic = "climdes/data/+/+/+/+";
  client.subscribe(topic, (err) => {
    if (err) {
      console.error("Failed to subscribe:", err);
    } else {
      console.log(`Subscribed to the required topic`);
    }
  });
});

client.on("message", async function (topic, message) {
  try {
    // Only try to parse if message starts with { or [
    console.log(topic);
    const messageStr = message.toString();
    const publisherMessage =
      messageStr.startsWith("{") || messageStr.startsWith("[")
        ? JSON.parse(messageStr)
        : messageStr;

    if (typeof publisherMessage === "object") {
      const readings = await SensorReadings.create({
        stationName: publisherMessage.head.environment.station_name,
        dataLoggerModel: publisherMessage.head.environment.model,
        dataLoggerSerialNumber: publisherMessage.head.environment.serial_no,
        data: {
          soilElectricalConductivity: publisherMessage.data[0].vals[0],
          soilMoisture: publisherMessage.data[0].vals[1],
          soilPH: publisherMessage.data[0].vals[2],
          atmosphericTemperature: publisherMessage.data[0].vals[3],
          relativeHumidity: publisherMessage.data[0].vals[4],
          windSpeed: publisherMessage.data[0].vals[5],
          windDirection: publisherMessage.data[0].vals[6],
          solarRadiation: publisherMessage.data[0].vals[7],
          precipitation: publisherMessage.data[0].vals[8],
          barometricPressure: publisherMessage.data[0].vals[9],
          soilTemperature: publisherMessage.data[0].vals[10],
          vaporPressure: publisherMessage.data[0].vals[11],
          windGust: publisherMessage.data[0].vals[12],
          lightningStrikeCount: publisherMessage.data[0].vals[13],
          lightningStrikeDistance: publisherMessage.data[0].vals[14],
        },
        timestamp: publisherMessage.data[0].time,
      });
      console.log(
        `Sensor readings for ${readings.stationName} saved to database`
      );
    }
  } catch (error) {
    console.error("Error processing message:", error);
  }
});

app.use(globalErrorHandler);

module.exports = app;
