import { Server } from "socket.io"

let io: Server

export const setSocketIO = (socketInstance: Server) => {
    io = socketInstance
}

export { io }