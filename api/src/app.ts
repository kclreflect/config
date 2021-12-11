import fastify from 'fastify'
import { FastifyCookieOptions } from 'fastify-cookie'
import fastifyEnv from 'fastify-env'
import cookie from 'fastify-cookie'
import { CallbackRoute } from './modules/routes/nokia/callback'

declare module 'fastify' {
  interface FastifyInstance {
    config: {
      PORT:string,
      COOKIE_SECRET:string,
      DB_STRING:string,
      DB_USER:string,
      DB_PASS:string
    };
  }
}

export default async() => {
  
  const app = fastify({logger: true});
  
  await app.register(fastifyEnv, {
    dotenv: true,
    schema: {
      type: 'object',
      properties: {
        PORT: {type:'string', default:3000},
        COOKIE_SECRET: {type:'string', default:'secret'},
        DB_STRING: {type:'string'},
        DB_USER: {type:'string'},
        DB_PASS: {type:'string'}
      }
    }
  });

  app.register(cookie, {
    secret: app.config.COOKIE_SECRET
  } as FastifyCookieOptions);

  app.register(CallbackRoute);
  
  return app;

}

