import { Request, Response, NextFunction } from "express"
import Log from "../models/Log"

const logger = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const start = Date.now()

    res.on("finish", async () => {

        const responseTime =
            Date.now() - start

        await Log.create({
            endpoint: req.originalUrl,
            method: req.method,
            status: res.statusCode,
            responseTime
        })

    })

    next()
}

export default logger