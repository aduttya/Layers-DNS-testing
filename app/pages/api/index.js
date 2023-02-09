import dbconnect from '../../server'
import mongoose from "mongoose";
import User from '../../models/user';

export default async function handler(req, res) {

await dbconnect()

const {method,
  query: {address},
} = req
console.log("The query is : ",{address})

  switch(method){
    case 'GET' :
      try{
      let stats = await User.find({address:address})
      if(stats){
        res.status(200).json({ success : true, data : stats })
      }else{
        res.status(400).json({success : false})
      }
    }catch(err){
        res.status(400).json({success : false})
    }
      break;
    case 'POST' :
        try{
        let stats = await User.create(req.body)
        if(stats){
          res.status(200).json({ success : true, data : stats })
        }else{
          console.log(stats)
          res.status(400).json({success : false})
        }
      }catch(err){
        console.log("failed")
          res.status(400).json({success : false})
      }
    break;

    case 'PUT' :
      try{
      let stats = await User.findOneAndUpdate({address:address},
        {$push:
          {contracts:req.body}}
        )
      if(stats){
        res.status(200).json({ success : true, data : stats })
      }else{
        console.log(stats)
        res.status(400).json({success : false})
      }
    }catch(err){
      console.log("failed")
        res.status(400).json({success : false})
    }
  break;
  }
}
