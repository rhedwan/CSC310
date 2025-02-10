const mqtt = require("mqtt");

const options = {
  host: "6e37007c45cc434fbf9239c9847e0f89.s1.eu.hivemq.cloud",
  port: 8883,
  protocol: "mqtts",
  username: "climdes",
  password: "Climdes1234",
};

// initialize the MQTT client
const client = mqtt.connect(options);

client.on("connect", function () {
  const topic = "weatherstation/sensor1";
  const message = JSON.stringify({
    head: {
      transaction: 0,
      signature: 13579,
      environment: {
        station_name: "EastLansing",
        table_name: "Minutely",
        model: "CR350",
        serial_no: "7659",
        os_version: "CR350-WIFI.Std.1.06",
        prog_name: "CPU:Test2.CRB",
      },
      fields: [
        {
          name: "BattV_Min",
          type: "xsd:float",
          units: "Volts",
          process: "Min",
          settable: false,
        },
      ],
    },
    data: [
      {
        time: "2025-01-29T05:04:00",
        vals: [11.68],
      },
    ],
  });

  client.publish(topic, message, () => {
    console.log("Message sent", message);
    // Wait a short time before disconnecting
    setTimeout(() => {
      client.end();
      console.log("Publisher disconnected");
    }, 1000);
  });
});

client.on("error", function (error) {
  console.log(error);
});
