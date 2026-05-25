import jwt from "jsonwebtoken"
import express from "express"
import ApiLog from "../models/ApiLog"

const router = express.Router()

const verifyToken = (
    req: any,
    res: any,
    next: any
) => {

    const token =
        req.headers.authorization

    if (!token) {
        return res
        .status(401)
        .json({
            message: "No token"
        })
    }

    try {

        jwt.verify(
            token,
            "secretkey"
        )

        next()

    } catch {

        return res
        .status(403)
        .json({
            message: "Invalid token"
        })
    }

}

router.get("/", verifyToken, async (req, res) => {

    const logs = await ApiLog.find().sort({ createdAt: -1 })

    res.json(logs)

})

export default router