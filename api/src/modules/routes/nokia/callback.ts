import { FastifyInstance, FastifyPluginAsync, RouteOptions } from 'fastify';
import { Callback, CallbackType } from '../../../types/nokia-callback';
import mongoose from 'mongoose';
import logger from '../../../winston'
import { NokiaModel } from '../../db/models/nokia'

export const callbackRoute:FastifyPluginAsync = async(server:FastifyInstance) => {
  server.route<{Querystring:CallbackType}>({
    url: '/callback',
    logLevel: 'info',
    method: ['GET', 'HEAD'],
    schema: {querystring:Callback},
    onRequest: process.env.NODE_ENV&&process.env.NODE_ENV=="test"?(req, rep, done)=>{done()}:server.basicAuth,
    handler: async(req, rep) => {
      const callback = req.query;
      try { 
        if(mongoose.connection.readyState==1) await NokiaModel.updateOne({'_id':req.cookies.patientId}, {'nokiaId':callback.userid}, {upsert:true}); 
      } catch(error) { 
        logger.error('error updating nokia credentials: '+error); 
      }
      rep.code(200).send();
    }
  });
};
