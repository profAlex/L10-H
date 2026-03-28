import { UserIdType } from "./user-id-type";
import { ObjectId } from "mongodb";

declare global {
    declare namespace Express {
        export interface Request {
            user: UserIdType | undefined;
            sessionId: ObjectId | undefined;
            deviceId: string | undefined;
        }
    }
}
