import { CustomResult } from "../../common/result-type/result-type";
import { HttpStatus } from "../../common/http-statuses/http-statuses";
import { RotationPairToken } from "./auth-token-rotation-pair";
import { jwtService } from "./jwt-service";

export async function createTokenPair(
    userId: string,
    sessionIat: Date,
    sessionExp: Date,
    sessionDeviceId: string
): Promise<CustomResult<RotationPairToken>> {
    // пробуем создать accessToken
    const resCreatingAccessToken = await jwtService.createAccessToken({
        userId: userId,
    });
    if (!resCreatingAccessToken.data?.accessToken) {
        console.error(resCreatingAccessToken.statusDescription);
        return {
            data: null,
            statusCode: resCreatingAccessToken.statusCode,
            statusDescription: resCreatingAccessToken.statusDescription,
            errorsMessages: resCreatingAccessToken.errorsMessages,
        };
    }

    // пробуем создать refreshToken
    const resCreatingRefreshToken = await jwtService.createRefreshToken({
        userId: userId,
        deviceId: sessionDeviceId,
        iat: Math.floor(sessionIat.getTime() / 1000), // Math.floor лишнее? мы уже передали сформированный с учетом округления тип Data
        exp: Math.floor(sessionExp.getTime() / 1000), // Math.floor лишнее? мы уже передали сформированный с учетом округления тип Data
    });
    if (!resCreatingRefreshToken.data?.refreshToken) {
        console.error(resCreatingRefreshToken.statusDescription);
        return {
            data: null,
            statusCode: resCreatingAccessToken.statusCode,
            statusDescription: resCreatingAccessToken.statusDescription,
            errorsMessages: resCreatingAccessToken.errorsMessages,
        };
    }

    return {
        data: {
            accessToken: resCreatingAccessToken.data.accessToken,
            refreshToken: resCreatingRefreshToken.data.refreshToken,
            relatedUserId: userId,
        },
        statusCode: HttpStatus.Ok,
        statusDescription: "",
        errorsMessages: [
            {
                field: "",
                message: "",
            },
        ],
    };
}
