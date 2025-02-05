const express = require('express');
const mongoose = require('mongoose');
const http = require("http");
const path = require("path");
const UserRouter = require('./routes/User')
const GMRouter = require('./routes/GroupMessage')
const PMRouter = require('./routes/PrivateMessage')
const GroupMessage = require('./models/GroupMessage')

require("dotenv").config();

const SERVER_PORT = process.env.PORT || 3000
const app = express();
app.use(express.json()); // Make sure it comes back as json
app.use(express.urlencoded({ extended: true }));


const { Server } = require('socket.io')
const appServer = http.createServer(app)
const io = new Server(appServer)


//TODO - Replace you Connection String here
mongoose.connect('mongodb+srv://Admin:pDiGDgich3CcFvBw@cluster0.2tyy8.mongodb.net/LabTest01?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(success => {
    console.log('Success Mongodb connection')
}).catch(err => {
    console.log('Error Mongodb connection')
});

app.use('/user', UserRouter);
app.use('/gm', GMRouter);
app.use('/pm', PMRouter);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'chat.html'))
})

app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signup.html'))
})

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'))
})

app.get("/chat", (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'chat.html'))
})

app.get("/private", (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'privateChat.html'))
})

let users = {}

io.on("connection", (socket)=>{
    console.log(`User ${socket.id} has been connected`)

    socket.on("joinRoom", async ({username, room})=>{
        socket.join(room)
        users[socket.id] = {username, room}

        console.log(`${username} has joined ${room}`)

        try{
            const chatLog = await GroupMessage.find({room}).sort({time: 1})
            // console.log(chatLog)
            socket.emit("previousMessages", chatLog)
        }catch(e){
            console.error("Error fetching logs", e)
        }

    })

    socket.on("chatMessage", async({username, room, message})=>{
        const msgData = {
            from_user: username,
            room,
            message,
        }

        let userMSG = await GroupMessage.create(msgData)
        
        console.log(userMSG)

        io.to(room).emit("message",userMSG)
    })

    socket.on("typing", ({ username, room }) => {
        socket.to(room).emit("typing", username);
    });

    socket.on("disconnect", ()=>{
        if(users[socket.id]){
            const {username, room} = users[socket.id]
            delete users[socket.id]

            console.log(`${username} has left ${room}`)
            socket.to(room).emit("message", {
                username: "System",
                text: `${username} has left the chat`
            })
        }
    })

    //1 on 1 chat

    

})

appServer.listen(SERVER_PORT, () => {
    console.log(`Server is running... at http://localhost:${SERVER_PORT}`)
});
