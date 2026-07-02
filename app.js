const User = require('./models/User');
const Device = require('./models/Device');
const LocationPing = require('./models/LocationPing');
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));
const express = require("express")
const app = express();
const path = require("path");
//We need a http server for socketio
const http = require("http");
const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server);
// Set EJS as the view engine
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
io.on("connection", function (socket) {
    socket.on("send-location",function (data){
        io.emit("receive-location",{id:socket.id,...data});
    })
    socket.on("disconnect",function(){
        io.emit("user-disconnected",socket.id);
    })
});
app.get("/", function (req, res) {
    res.render("index");
});
app.use(express.json());
app.get('/api/ping', (req, res) => {
    res.json({ message: 'Express is alive', time: new Date() });
});
server.listen(3000, () => {
    console.log('Server listening on http://localhost:3000');
});