import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { NokiaId, NokiaIdType, PatientId, PatientIdType } from '../../../types/nokia-id';
import logger from '../../../winston'
import { Nokia, NokiaModel } from '../../db/models/nokia'

export const idRoute:FastifyPluginAsync = async(server:FastifyInstance) => {
  server.route<{Body:NokiaIdType, Reply:PatientIdType}>({
    url: '/id',
    logLevel: 'info',
    method: ['POST'],
    schema: {body:NokiaId, response:{200:PatientId}},
    onRequest: process.env.NODE_ENV&&process.env.NODE_ENV=="test"?(req, rep, done)=>{done()}:server.basicAuth,
    handler: async(req, rep) => {
      const {body:nokia} = req;
      let users:Array<Nokia> = [];
      try { 
        users = await NokiaModel.find({'_id':{$ne:undefined}, 'nokiaId':nokia.nokiaId});
      } catch(error) { 
        logger.error('error updating nokia credentials: '+error); 
      }
      rep.code(200).send(users.length?{"patientId":users[0]._id}:{"patientId":""});
    }
  });
};
