'use strict'
const got = require("got");
const fs = require("fs").promises;

module.exports = async (event, context) => {
  const result = {
    'status': 'Received input: ' + JSON.stringify(event.body)
  }
  try {
    await got.get("https://services.internal.reflectproject.co.uk");
  } catch(error) {
    console.log("Error: "+error);
  }
  return context
    .status(200)
    .succeed(result)
}

