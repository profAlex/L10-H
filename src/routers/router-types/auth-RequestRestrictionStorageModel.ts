import { ObjectId } from "mongodb";

export type RequestRestrictionStorageModel = {
    _id: ObjectId;
    deviceIp: string;
    deviceName: string;
    calledURL: string;
    dateOfRequest: Date;
}