import fastify from 'fastify'
import {FastifyCookieOptions} from 'fastify-cookie'
import fastifyBasicAuth, { FastifyBasicAuthOptions } from 'fastify-basic-auth';
import fastifyPointOfView from 'point-of-view';
import fastifyEnv from 'fastify-env'
import cookie from 'fastify-cookie'
import fastifyStatic from 'fastify-static';
import mongoose from 'mongoose';
import pug from 'pug';
import {join} from 'path';
import logger from './winston'
import { promises as fs } from 'fs';
import nokia from './modules/routes/nokia'

declare module 'fastify' {
  interface FastifyInstance {
    config: {PORT:string, COOKIE_SECRET:string, DB_STRING:string, DB_USER:string, DB_PASS:string, DB_PASS_PATH:string, ROOT_CERT_PATH:string, USER:string, PASSWORD:string};
  }
}

export default async() => {
  
  const app = fastify({logger: true});

  // env variables
  await app.register(fastifyEnv, {dotenv: true, schema: {type: 'object', properties: { PORT: {type:'string', default:3000}, COOKIE_SECRET: {type:'string', default:'secret'}, DB_STRING: {type:'string'}, DB_USER: {type:'string'}, DB_PASS: {type:'string'}, DB_PASS_PATH: {type:'string'}, ROOT_CERT_PATH: {type:'string'}, USER: {type:'string'}, PASSWORD: {type:'string'}}}});

  // db
  try { 
    if(mongoose.connection.readyState==0) await mongoose.connect('mongodb://'+app.config.DB_STRING, {
      user:app.config.DB_USER, 
      pass:app.config.DB_PASS?app.config.DB_PASS:(await fs.readFile(app.config.DB_PASS_PATH, "utf8")),
      ssl: true,
      sslValidate: true, 
      sslCA: app.config.ROOT_CERT_PATH,
      serverSelectionTimeoutMS:1000
    }); 
  } catch(error) { 
    logger.error('error connecting to db: '+error); 
  }

  // auth
  const authenticate = {realm:'reflect'}
  const validate = async(username:string, password:string) => { if(username!==app.config.USER||password!==app.config.PASSWORD) return new Error('access denied');}
  app.register(fastifyBasicAuth, {authenticate, validate} as FastifyBasicAuthOptions);

  app.addHook('onRequest', process.env.NODE_ENV&&process.env.NODE_ENV=="test"?(_req:any, _rep:any, done:any)=>{done()}:app.basicAuth);

  app.setErrorHandler((err, _req, rep) => {
    if(err.statusCode===401) {
      rep.code(401).send('unauthorized');
      return;
    }
    rep.send(err);
  });
 
  // cookies
  app.register(cookie, {secret:app.config.COOKIE_SECRET} as FastifyCookieOptions);

  // views
  app.register(fastifyStatic, {root:join(__dirname, 'public'), prefix:'/assets/'});
  app.register(fastifyPointOfView, {engine:{pug:pug}, root:join(__dirname, 'views'),});

  // routes
  app.register(nokia, {prefix:'/nokia'});
  
  return app;

}

