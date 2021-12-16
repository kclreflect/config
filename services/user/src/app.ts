import fastify from 'fastify'
import {FastifyCookieOptions} from 'fastify-cookie'
import fastifyBasicAuth, { FastifyBasicAuthOptions } from 'fastify-basic-auth';
import fastifyPointOfView from 'point-of-view';
import fastifyEnv from 'fastify-env'
import cookie from 'fastify-cookie'
import fastifyStatic from 'fastify-static';
import pug from 'pug';
import {join} from 'path';
import nokia from './modules/routes/nokia'
import connect from './modules/db/index';
import { Db } from './modules/db/index';

declare module 'fastify' {
  interface FastifyInstance {
    config: {PORT:string, COOKIE_SECRET:string, DB_STRING:string, DB_USER:string, DB_PASS:string, DB_PASS_PATH:string, ROOT_CERT_PATH:string, USER:string, PASSWORD:string},
    db:Db;
  }
}

export default async() => {
  
  const app = fastify({logger:true});

  // env
  await app.register(fastifyEnv, {dotenv: true, schema: {type: 'object', properties: { PORT: {type:'string', default:3000}, COOKIE_SECRET: {type:'string', default:'secret'}, DB_STRING: {type:'string'}, DB_USER: {type:'string'}, DB_PASS: {type:'string'}, DB_PASS_PATH: {type:'string'}, ROOT_CERT_PATH: {type:'string'}, USER: {type:'string'}, PASSWORD: {type:'string'}}}});

  // db
  await app.register(connect, {URL:app.config.DB_STRING, DB_USER:app.config.DB_USER, DB_PASS:app.config.DB_PASS, DB_PASS_PATH:app.config.DB_PASS_PATH, ROOT_CERT_PATH:app.config.ROOT_CERT_PATH});

  // auth
  const authenticate = {realm:'reflect'}
  const validate = async(username:string, password:string) => { if(username!==app.config.USER||password!==app.config.PASSWORD) return new Error('access denied');}
  await app.register(fastifyBasicAuth, {authenticate, validate} as FastifyBasicAuthOptions);

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

