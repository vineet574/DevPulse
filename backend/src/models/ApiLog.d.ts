import mongoose from "mongoose";
declare const _default: mongoose.Model<{
    endpoint: string;
    method: string;
    statusCode: number;
    responseTime: number;
} & mongoose.DefaultTimestampProps, {}, {}, {
    id: string;
}, mongoose.Document<unknown, {}, {
    endpoint: string;
    method: string;
    statusCode: number;
    responseTime: number;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, {
    timestamps: true;
}> & Omit<{
    endpoint: string;
    method: string;
    statusCode: number;
    responseTime: number;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    endpoint: string;
    method: string;
    statusCode: number;
    responseTime: number;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    endpoint: string;
    method: string;
    statusCode: number;
    responseTime: number;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, Omit<mongoose.DefaultSchemaOptions, "timestamps"> & {
    timestamps: true;
}> & Omit<{
    endpoint: string;
    method: string;
    statusCode: number;
    responseTime: number;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, unknown, {
    endpoint: string;
    method: string;
    statusCode: number;
    responseTime: number;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>, {
    endpoint: string;
    method: string;
    statusCode: number;
    responseTime: number;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export default _default;
//# sourceMappingURL=ApiLog.d.ts.map