import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { Callback, CallbackType } from '../../../types/nokia-callback';
import mongoose from 'mongoose';
import logger from '../../../winston'
import { NokiaModel } from '../../db/models/nokia'
import { promises as fs } from 'fs';

export const CallbackRoute:FastifyPluginAsync = async(server:FastifyInstance) => {
  server.route<{Querystring:CallbackType}>({
    url: '/callback',
    logLevel: 'info',
    method: ['GET', 'HEAD'],
    schema: {querystring:Callback},
    handler: async(req, rep) => {
      const callback = req.query;
      try { 
        if(mongoose.connection.readyState==0) await mongoose.connect('mongodb://'+server.config.DB_STRING, {
          user:server.config.DB_USER, 
          pass:server.config.DB_PASS?server.config.DB_PASS:(await fs.readFile(server.config.DB_PASS_PATH, "utf8")),
          ssl: true,
          sslValidate: true, 
          sslCA: server.config.ROOT_CERT_PATH,
          serverSelectionTimeoutMS:1000
        }); 
      } catch(error) { 
        logger.error('error connecting to db: '+error); 
      }
      try { 
        if(mongoose.connection.readyState==1) await NokiaModel.updateOne({'_id':req.cookies.patientId}, {'nokiaId':callback.userid}, {upsert:true}); 
      } catch(error) { 
        logger.error('error updating nokia credentials: '+error); 
      }
      rep.code(200).send();
    }
  });
};
