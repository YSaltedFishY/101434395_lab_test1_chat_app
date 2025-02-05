const express = require('express');
const mongoose = require('mongoose');
const path = require("path");
const UserRouter = require('./routes/User')

require("dotenv").config();

const SERVER_PORT = process.env.PORT || 3000
const app = express();
app.use(express.json()); // Make sure it comes back as json

//TODO - Replace you Connection String here
mongoose.connect('mongodb+srv://Admin:pDiGDgich3CcFvBw@cluster0.2tyy8.mongodb.net/LabTest01?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(success => {
  console.log('Success Mongodb connection')
}).catch(err => {
  console.log('Error Mongodb connection')
});

app.use('/user',UserRouter);

app.get("/", (req,res)=>{
    res.sendFile(path.join(__dirname, 'views', 'signup.html'))
})

app.get("/signup", (req,res)=>{
    res.sendFile(path.join(__dirname, 'views', 'signup.html'))
})

app.get("/login", (req,res)=>{
    res.sendFile(path.join(__dirname, 'views', 'signup.html'))
})

app.listen(SERVER_PORT, () => { console.log(`Server is running... at ${SERVER_PORT}`) });
