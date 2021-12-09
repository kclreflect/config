'use strict'
const got = require("got");
const fs = require("fs").promises;
const amqp = require("amqplib")

module.exports = async (event, context) => {
  let opts, connection;
  try {
    opts = {
      cert: await fs.readFile(process.env.cert_path),
      key: await fs.readFile(process.env.key_path),
      ca: [await fs.readFile(process.env.ca_path)]
    }
  } catch(error) {
    console.log("error reading tls information: "+error);
  }
  try {
    connection = await amqp.connect("amqps://"+process.env.queue_username+":"+process.env.queue_password+"@"+process.env.queue_host, opts);
    let channel = await connection.createChannel();
    await channel.assertExchange(process.env.exchange_name, 'direct', {durable: false });
    channel.publish(process.env.exchange_name, process.env.exchange_topic, Buffer.from(JSON.stringify({"hello":"world"})), {"contentType": "application/json"});
    await channel.close();
    await connection.close();
  } catch(error) {
    console.log("error sending information to queue: "+error);
    if(connection) connection.close();
  }
  return context.status(200).succeed();
}
