const mongoose = require("mongoose");

const sensorReadingSchema = new mongoose.Schema(
  {
    stationName: String,
    dataLoggerModel: String,
    dataLoggerSerialNumber: String,
    timestamp: Date,
    data: {
      soilElectricalConductivity: Number,
      soilMoisture: Number,
      soilPH: Number,
      atmosphericTemperature: Number,
      relativeHumidity: Number,
      windSpeed: Number,
      windDirection: Number,
      solarRadiation: Number,
      precipitation: Number,
      barometricPressure: Number,
      soilTemperature: Number,
      vaporPressure: Number,
      windGust: Number,
      lightningStrikeCount: Number,
      lightningStrikeDistance: Number,
    },
  },
  { timestamps: true }
);

const SensorReadings = mongoose.model("SensorReadings", sensorReadingSchema);

module.exports = SensorReadings;
