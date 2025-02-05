const express = require("express")
const router = express.Router()
const PrivateMessage = require("../models/PrivateMessage")

router.get('/', async(req,res)=>{
    const pmessages = await PrivateMessage.find({})
    try{
        res.send(pmessages)
    }catch(e){
        res.status(500).send(e)
    }
})


module.exports = router;