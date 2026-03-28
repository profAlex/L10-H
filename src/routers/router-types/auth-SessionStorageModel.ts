import { UserSession } from "../../common/classes/session-class";

// export type SessionStorageModel = {
//     userId: string;
//     deviceId: string;
//     issuedAt: Date;
//     deviceName: string;
//     deviceIp: string;
//     expiresAt: Date;
// }

export interface SessionStorageModel extends UserSession {}