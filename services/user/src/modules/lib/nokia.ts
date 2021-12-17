import got, { Response } from 'got';
import { TokenResponseBody } from '../types/nokia'
import logger from '../../winston';

export default class Nokia {

  static async getAccessToken(tokenUrl:string, clientId:string, consumerSecret:string, callbackBaseUrl:string, code:string):Promise<TokenResponseBody|undefined> {
    try {
      logger.debug('sending request for access token...')
      let access:Response<TokenResponseBody> = await got.post(tokenUrl, {form:{
        'grant_type': 'authorization_code',
        'client_id': clientId,
        'client_secret': consumerSecret,
        'code': code,
        'redirect_uri': callbackBaseUrl+'/nokia/callback'
      }, responseType:'json'});
      logger.debug('response from access token request: '+access?.statusCode);
      if(access.statusCode==200) return access.body;
    } catch(error) {
      logger.error('error getting access token: '+error);
    }
    return undefined;
  }

}
