import { io } from "../socket"
import { Request, Response, NextFunction } from "express"
import ApiLog from "../models/ApiLog"

const loggerMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const start = Date.now()

    res.on("finish", async () => {

        const responseTime = Date.now() - start

        const newLog = await ApiLog.create({
            endpoint: req.originalUrl,
            method: req.method,
            statusCode: res.statusCode,
            responseTime
        })

        io.emit("new-log", newLog)

        console.log({
            endpoint: req.originalUrl,
            method: req.method,
            statusCode: res.statusCode,
            responseTime
        })

    })

    next()
}

export default loggerMiddleware