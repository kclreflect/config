import { expect } from 'chai';
import dbHandler from './db-handler';
import { ImportMock } from 'ts-mock-imports';
import build from '../src/app';
import * as Nokia from '../src/modules/lib/nokia';
import cookieParser from 'set-cookie-parser';
import { NokiaModel } from '../src/modules/db/models/nokia';

let handler:dbHandler;

before(async()=>{
  handler = await dbHandler.factory();
  await handler.connect();
});

afterEach(async()=>await handler.clearDatabase());

after(async()=>{await handler.closeDatabase();});

describe('user', () => {
  
  const accessTokenResponse = {access_token:"abc", expires_in:111, token_type:"abc", scope:"abc", refresh_token:"abc", userid:"00DEF"};

  it('can create user', async() => {
    const app = await build();
    const mockManager = ImportMock.mockStaticClass(Nokia);
    mockManager.mock('getAccessToken', accessTokenResponse);
    const setIdCookie = await app.inject({method:'POST', url:'/nokia/setIdCookie', payload:{'patientId':'00ABC'}});
    const addUser = await app.inject({method:'GET', url:'/nokia/callback?code=00DEF&state=XYZ', cookies:{[app.config.PATIENT_ID_COOKIE]:cookieParser.parseString(setIdCookie.headers['set-cookie']?.toString()||"").value}});
    ImportMock.restore();
    expect(addUser.statusCode).to.equal(200);
    expect(await NokiaModel.find({'_id':'00ABC'})).to.have.lengthOf(1);
    const getUser = await app.inject({method:'POST', url:'/nokia/id', payload:{"nokiaId":"00DEF"}});
    expect(getUser.statusCode).to.equal(200);
    ImportMock.restore();
    expect(getUser.body).to.equal('{"patientId":"00ABC"}');
  }).timeout(0);

});
