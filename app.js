const User = require('./models/User');
const Device = require('./models/Device');
const LocationPing = require('./models/LocationPing');
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));
const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
    },
    pingInterval: 10000,
    pingTimeout: 5000,
});
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
const deviceRoutes = require('./routes/devices');
app.use('/api/devices', deviceRoutes);
io.on("connection", function (socket) {
    const { groupId, deviceId } = socket.handshake.query;
    if (groupId) {
        socket.join(groupId);
        console.log(`Socket ${socket.id} joined group ${groupId}`);
    }
    socket.on('send-location', async (data) => {
        if (groupId) {
            socket.to(groupId).emit('receive-location', {
                id: deviceId,
                latitude: data?.latitude,
                longitude: data?.longitude,
                name: data?.name,
            });
        }
        if (deviceId) {
            try {
                await LocationPing.create({
                    device: deviceId,
                    lat: data.latitude,
                    lng: data.longitude,
                });
                await Device.findByIdAndUpdate(deviceId, {
                    lastLocation: {
                        lat: data.latitude,
                        lng: data.longitude,
                        updatedAt: new Date(),
                    },
                });
            } catch (err) {
                console.error('Failed to persist location ping:', err.message);
            }
        }
    });
    socket.on("disconnect", function() {
        if (groupId && deviceId) {
            socket.to(groupId).emit("user-disconnected", deviceId);
        }
    });
});
app.get("/", function (req, res) {
    res.render("index");
});
const groupRoutes = require('./routes/group');
app.use('/api/groups', groupRoutes);
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
app.get('/api/ping', (req, res) => {
    res.json({ message: 'Express is alive', time: new Date() });
});
server.listen(3000, () => {
    console.log('Server listening on http://localhost:3000');
});
module.exports = {app,server};