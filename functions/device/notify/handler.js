'use strict'
const got = require("got");
const fs = require("fs").promises;
const amqp = require("amqplib")

module.exports = async (event, context) => {
  const result = {
    'status': 'Received input: ' + JSON.stringify(event.body)
  }
  let opts, connection;
  try {
    opts = {
      cert: await fs.readFile('/var/openfaas/secrets/tls.crt'),
      key: await fs.readFile('/var/openfaas/secrets/tls.key'),
      ca: [await fs.readFile('/var/openfaas/secrets/queue.pem')]
    }
  } catch(error) {
    console.log("Error: "+error);
  }
  try {
    connection = await amqp.connect("amqps://"+process.env.queue_username+":"+process.env.queue_password+"@"+process.env.queue_host, opts);
    let channel = await connection.createChannel();
    await channel.assertQueue(this.queue_name, {durable:true});
    connection.close();
  } catch(error) {
    console.log("Error: "+error);
    if(connection) connection.close();
  }

  return context
    .status(200)
    .succeed(result)
}

