import { expect } from 'chai';
import dbHandler from './db-handler';
import build from '../app';
import { NokiaModel } from '../modules/db/models/nokia'

let handler:dbHandler;

before(async()=> {
  handler = await dbHandler.factory();
  await handler.connect();
});

after(async () => {
  await handler.clearDatabase();
  await handler.closeDatabase();
});

describe('user', () => {

  it('can create user', async() => {
    const app = await build();
    const response = await app.inject({method:'GET', url:'/callback?userid=00DEF&code=XYZ', cookies:{'patientId':'00ABC'}});
    expect(response.statusCode).to.equal(200);
  }).timeout(0);

  it('user exists after creation', async() => {
    expect(await NokiaModel.find({'_id':'00ABC'})).to.have.lengthOf(1);
  }).timeout(0);

});
