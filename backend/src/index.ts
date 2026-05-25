import authRoutes from "./routes/authRoutes"
import http from "http"
import { Server } from "socket.io"
import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors"
import loggerMiddleware from "./middleware/loggerMiddleware"
import logRoutes from "./routes/logRoutes"
import { setSocketIO } from "./socket"

dotenv.config()

const app = express()

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173"
    }
})

setSocketIO(io)

app.use(cors())
app.use(express.json())
app.use(loggerMiddleware)

mongoose.connect(process.env.MONGO_URI as string)
.then(() => {
    console.log("MongoDB Connected")
})
.catch((error) => {
    console.log(error)
})

app.get("/", (req, res) => {
    res.send("DevPulse Backend Running")
})

app.use("/api/logs", logRoutes)
app.use("/api/auth", authRoutes)


server.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`)
})