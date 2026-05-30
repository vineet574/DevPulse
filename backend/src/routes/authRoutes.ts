import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User"

const router = express.Router()

router.post("/register", async (req, res) => {

    const { name, email, password } = req.body

    const existingUser = await User.findOne({ email })

    if (existingUser) {
        return res.status(400).json({
            message: "User already exists"
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
        name,
        email,
        password: hashedPassword
    })

    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
    )

    res.json({
        token,
        user
    })

})

router.post("/login", async (req, res) => {

    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (!user) {
        return res.status(400).json({
            message: "User not found"
        })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        return res.status(400).json({
            message: "Invalid credentials"
        })
    }

    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
    )

    res.json({
        token,
        user
    })

})

export default router