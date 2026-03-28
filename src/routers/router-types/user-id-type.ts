import { ObjectId } from "mongodb";

export type UserIdType = { userId: string | null };


export type SessionMetaDataType = {
    user: UserIdType;
    sessionId: ObjectId | undefined;
    deviceId: string | undefined;
};
