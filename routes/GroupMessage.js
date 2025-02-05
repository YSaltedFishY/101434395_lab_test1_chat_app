const express = require("express")
const router = express.Router()
const GroupMessage = require("../models/GroupMessage")

router.get('/', async(req,res)=>{
    const gmessages = await GroupMessage.find({})
    try{
        res.send(gmessages)
    }catch(e){
        res.status(500).send(e)
    }
})


module.exports = router;