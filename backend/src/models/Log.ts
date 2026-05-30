import mongoose from "mongoose"

const logSchema = new mongoose.Schema(
{
    endpoint: String,
    method: String,
    status: Number,
    responseTime: Number
},
{
    timestamps: true
}
)

export default mongoose.model("Log", logSchema)