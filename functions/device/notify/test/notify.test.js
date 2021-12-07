const chai = require('chai');
const expect = chai.expect;
const notify = require('../handler');
const FunctionContext = require('./function-context');
const FunctionEvent = require('./function-event');

describe('user', () => {

  it('can reach notify', async() => {
    let cb = (err, val) => {};
    let context = new FunctionContext(cb);
    await notify(new FunctionEvent({}), context);
    expect(context.status()).to.equal(200);
  }).timeout(0);

});
