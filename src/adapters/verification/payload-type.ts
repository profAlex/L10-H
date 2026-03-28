import { UserIdType } from "../../routers/router-types/user-id-type";

export type JwtAccessPayloadType = UserIdType & {
    // iat: number;
    // exp: number;
    // deviceId: string;
};


export type JwtRefreshPayloadType = UserIdType & {
    iat: number;
    exp: number;
    deviceId: string;
};
// const testVariable: JwtPayloadType = {};
// console.log(testVariable);
