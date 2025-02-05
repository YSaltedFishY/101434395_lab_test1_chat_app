const express = require("express")
const router = express.Router();
const User = require("../models/User")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
// const authMiddleware = require('../middleware/authMiddleware')

router.post("/signup", async(req,res)=>{
    const {username,firstname,lastname,password} = req.body

    try{
        let user = await User.findOne({username})
        if (user){
            return res.status(400).json({message: "Username already exist"})
        }

        const hashpw = await bcrypt.hash(password, 10)

        user = new User({
            username: username,
            firstname: firstname,
            lastname: lastname,
            password: hashpw
        })
        
        await user.save()

        res.status(201).send(user)
    }catch(e){
        res.status(500).json({
            message: "unable to register",
            error: e.message
        })
    }
})

router.post("/login", async(req, res)=>{
    const{ username, password} = req.body

    try{
        let user = await User.findOne({username})
        if (!user){
            return res.status(400).json({message: "User not found"})
        }

        const matchPW = await bcrypt.compare(password, user.password)

        if(!matchPW){
            return res.status(401).json({message: "Username or password is incorrect"})
        }

        const token = jwt.sign(
            {id: user._id, username: user.username},
            process.env.JWT_SECRET,
            {expiresIn: '8h'}
        )

        res.status(200).json({
            message: `Welcome ${user.firstname}`,
            profile: {
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname
            },
            token,
        })
    }catch(e){
        res.status(500).json({
            message: "unable to login",
            error: e.message
        })
    }
})

router.get('/', async(req,res)=>{
    const users = await User.find({})
    try{
        res.send(users)
    }catch(e){
        res.status(500).send(e)
    }
})


module.exports = router;