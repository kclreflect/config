import { expect } from 'chai';
import dbHandler from './db-handler';
import build from '../app';
import cookieParser from 'set-cookie-parser';
import { NokiaModel } from '../modules/db/models/nokia';

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
    const setIdCookie = await app.inject({method:'POST', url:'/nokia/setIdCookie', payload:{'patientId':'00ABC'}});
    const callback = await app.inject({method:'GET', url:'/nokia/callback?userid=00DEF&code=XYZ', cookies:{'bar':cookieParser.parseString(setIdCookie.headers['set-cookie']?.toString()||"").value}});
    expect(callback.statusCode).to.equal(200);
  }).timeout(0);

  it('user exists after creation', async() => {
    expect(await NokiaModel.find({'_id':'00ABC'})).to.have.lengthOf(1);
  }).timeout(0);

  it('can retrieve submitted user information', async() => {
    const app = await build();
    const addUser = await app.inject({method:'GET', url:'/nokia/callback?userid=00DEF&code=XYZ'});
    expect(addUser.statusCode).to.equal(200);
    const getUser = await app.inject({method:'POST', url:'/nokia/id', payload:{"nokiaId":"00DEF"}});
    expect(getUser.statusCode).to.equal(200);
    expect(getUser.body).to.equal('{"patientId":"00ABC"}');
  }).timeout(0);

});
