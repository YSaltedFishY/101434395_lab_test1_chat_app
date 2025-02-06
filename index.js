const express = require('express');
const mongoose = require('mongoose');
const http = require("http");
const path = require("path");
const UserRouter = require('./routes/User')
const GMRouter = require('./routes/GroupMessage')
const PMRouter = require('./routes/PrivateMessage')
const GroupMessage = require('./models/GroupMessage')
const PrivateMessage = require('./models/PrivateMessage')

require("dotenv").config();

const SERVER_PORT = process.env.PORT || 3000
const app = express();
app.use(express.json()); // Make sure it comes back as json
app.use(express.urlencoded({ extended: true }));
app.use(express.static('views'));



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
let usersInRoom = {}

io.on("connection", (socket)=>{
    console.log(`User ${socket.id} has been connected`)

    socket.on("joinRoom", async ({username, room})=>{
        socket.join(room)
        usersInRoom[socket.id] = { username, room };
        // users[socket.id] = {username, room}

        console.log(`${username} has joined ${room}`)

        try{
            const chatLog = await GroupMessage.find({room}).sort({time: 1})
            // console.log(chatLog)
            socket.emit("previousMessages", chatLog)
        }catch(e){
            console.error("Error fetching logs", e)
        }

        io.to(room).emit("userList", getUsersInRoom(room));

        io.to(room).emit("message", {
            from_user: room,
            message: `${username} has join the chat`,
            date_sent: new Date().toISOString(),
        });

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

    socket.on("leaveRoom", () => {
        let { username, room } = usersInRoom[socket.id] || {};
        if (room) {
            socket.leave(room);
            delete usersInRoom[socket.id];

            io.to(room).emit("userList", getUsersInRoom(room));
    
            io.to(room).emit("message", {
                from_user: "System",
                message: `${username} has left the chat`,
                date_sent: new Date().toISOString(),
            });
    
            console.log(`${username} left ${room}`);
        }
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

    function getUsersInRoom(room) {
        return Object.values(usersInRoom)
            .filter(user => user.room === room)
            .map(user => user.username);
    }

    //1 on 1 chat

    socket.on("privateMessage", async ({ sender, receiver, message }) => {
        console.log(`Private message from ${sender} to ${receiver}: ${message}`);
        try {
            const newPrivateMessage = new PrivateMessage({
                from_user: sender,
                to_user: receiver,
                message: message,
            });
    
            await newPrivateMessage.save(); 
    
            let receiverSocketId = Object.keys(usersInRoom).find(
                (socketId) => usersInRoom[socketId].username === receiver
            );
    
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("receivePrivateMessage", {
                    sender,
                    message,
                    date_sent: newPrivateMessage.date_sent,
                });
    
                console.log(`Sent private message to ${receiver}`);
            } else {
                console.log(`User ${receiver} not found for private message.`);
            }
        } catch (error) {
            console.error("Error saving private message:", error);
        }
    })

    socket.on("loadPrivateMessages", async ({ sender, receiver }) => {
        try {
            const messages = await PrivateMessage.find({
                $or: [
                    { from_user: { $regex: new RegExp("^" + sender + "$", "i") }, to_user: { $regex: new RegExp("^" + receiver + "$", "i") } },
                    { from_user: { $regex: new RegExp("^" + receiver + "$", "i") }, to_user: { $regex: new RegExp("^" + sender + "$", "i") } }
                ]
            }).sort({ date_sent: 1 });
    
            console.log(`sender: ${sender} | receiver: ${receiver}:`, messages);
            socket.emit("previousPrivateMessages", messages);
        } catch (error) {
            console.error("Error fetching private messages:", error);
        }
    });
    

})

appServer.listen(SERVER_PORT, () => {
    console.log(`Server is running... at http://localhost:${SERVER_PORT}`)
});
