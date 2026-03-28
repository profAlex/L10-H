"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTokenPair = createTokenPair;
const http_statuses_1 = require("../../common/http-statuses/http-statuses");
const jwt_service_1 = require("./jwt-service");
function createTokenPair(userId, sessionIat, sessionExp, sessionDeviceId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        // пробуем создать accessToken
        const resCreatingAccessToken = yield jwt_service_1.jwtService.createAccessToken({
            userId: userId,
        });
        if (!((_a = resCreatingAccessToken.data) === null || _a === void 0 ? void 0 : _a.accessToken)) {
            console.error(resCreatingAccessToken.statusDescription);
            return {
                data: null,
                statusCode: resCreatingAccessToken.statusCode,
                statusDescription: resCreatingAccessToken.statusDescription,
                errorsMessages: resCreatingAccessToken.errorsMessages,
            };
        }
        // пробуем создать refreshToken
        const resCreatingRefreshToken = yield jwt_service_1.jwtService.createRefreshToken({
            userId: userId,
            deviceId: sessionDeviceId,
            iat: Math.floor(sessionIat.getTime() / 1000), // Math.floor лишнее? мы уже передали сформированный с учетом округления тип Data
            exp: Math.floor(sessionExp.getTime() / 1000), // Math.floor лишнее? мы уже передали сформированный с учетом округления тип Data
        });
        if (!((_b = resCreatingRefreshToken.data) === null || _b === void 0 ? void 0 : _b.refreshToken)) {
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
            statusCode: http_statuses_1.HttpStatus.Ok,
            statusDescription: "",
            errorsMessages: [
                {
                    field: "",
                    message: "",
                },
            ],
        };
    });
}
