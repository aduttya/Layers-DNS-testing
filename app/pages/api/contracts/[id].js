import dbconnect from '../../../server';
import mongoose from "mongoose";
import Contract from '../../../models/contracts';

export default async function handler(req, res) {

await dbconnect()

const {
  query: {id},
  method
} = req

  switch(method){
    case 'GET' :
      try{
        console.log(id)
      let stats = await Contract.findById(id)
      if(stats){
        res.status(200).json({ success : true, data : stats })
      }else{
        res.status(400).json({success : false})
      }
    }catch(err){
        res.status(400).json({success : false})
    }
      break;

      case 'PUT' :
        try{
          console.log(id)
        let stats = await Contract.findByIdAndUpdate(id,req.body)
        if(stats){
          res.status(200).json({ success : true, data : stats })
        }else{
          res.status(400).json({success : false})
        }
      }catch(err){
          res.status(400).json({success : false})
      }
        break;
    }
}
