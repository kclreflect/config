import { Schema, model } from 'mongoose'

export interface Nokia {_id:string, nokiaId:string, token:string, refresh:string}
export const NokiaModel = model<Nokia>('nokia', new Schema<Nokia>({_id:{type:String, required:true}, nokiaId:{type:String, required:true}}));
