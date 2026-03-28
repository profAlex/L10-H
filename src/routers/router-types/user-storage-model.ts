import {ObjectId} from "mongodb";
import { User } from "../../common/classes/user-class";

// export type UserCollectionStorageModel = {
//     _id: ObjectId;
//     id: string
//     login: string;
//     email: string;
//     passwordHash: string
//     createdAt: Date
// }

export interface UserCollectionStorageModel extends User{};
