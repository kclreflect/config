const mongoose = require('mongoose');
const chai = require('chai');
const expect = chai.expect;
const dbHandler = require('./db-handler');
const userService = require('../handler');
const userModel = require('../models/user');
const FunctionContext = require('./function-context');
const FunctionEvent = require('./function-event');

before(async()=> {
  await dbHandler.connect();
});

after(async () => {
  await dbHandler.clearDatabase();
  await dbHandler.closeDatabase();
});

const userComplete = {
  patientId: 'abc',
  nokiaId: 'def',
  token: '12345',
  refresh: '12345'
};

describe('user', () => {

  it('can create user', async() => {
    let cb = (err, val) => {};
    let context = new FunctionContext(cb);
    expect(async()=>await userService(new FunctionEvent({body:userComplete}), context)).to.not.throw();
  });

  it('user exists after creation', async() => {
    expect(await userModel.find({'_id':userComplete.patientId})).to.have.lengthOf(1);
  });

});
