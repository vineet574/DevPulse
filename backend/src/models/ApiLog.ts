import mongoose from "mongoose"

const apiLogSchema = new mongoose.Schema(
{
    endpoint: {
        type: String,
        required: true
    },

    method: {
        type: String,
        required: true
    },

    statusCode: {
        type: Number,
        required: true
    },

    responseTime: {
        type: Number,
        required: true
    }
},
{
    timestamps: true
}
)

export default mongoose.model("ApiLog", apiLogSchema)