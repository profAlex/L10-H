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
exports.refreshTokenGuard = void 0;
const http_statuses_1 = require("../../common/http-statuses/http-statuses");
const jwt_service_1 = require("../../adapters/verification/jwt-service");
const command_repository_1 = require("../../repository-layers/command-repository-layer/command-repository");
const query_repository_1 = require("../../repository-layers/query-repository-layer/query-repository");
const refreshTokenGuard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.cookies || {}; // || {} введено для тех случаев если забыли например подключить cooke-parcer, тогда поля cookies в структуре req вообще будет отсутствовать и тогда undefined крашнет приложение
    if (!refreshToken) {
        return res.status(http_statuses_1.HttpStatus.Unauthorized).json({
            error: `Malformed refresh token, was not found.`,
        });
    }
    const rawPayload = yield jwt_service_1.jwtService.verifyRefreshToken(refreshToken);
    if (!rawPayload) {
        return res.status(http_statuses_1.HttpStatus.Unauthorized).json({
            error: `Improper refresh token format`,
        });
    }
    // вызов jwtService.verifyRefreshToken() сам по себе не гарантирует, что в rawPayload
    // присутствуют все поля из JwtRefreshPayloadType, которые мы ожидаем
    // поэтому нужно добавлять явные проверки в рантайме
    if (!rawPayload.userId) {
        return res.status(http_statuses_1.HttpStatus.Unauthorized).json({
            error: `Improper refresh token format. Missing userId in refresh token.`,
        });
    }
    // Несмотря на предупреждение, проверка в рантайме необходима, потому что:
    // 1. JWT‑токен может быть подделан или изменён;
    // 2. токен может быть создан другой версией сервиса с другой структурой;
    // 3. данные могут быть повреждены при передаче;
    // 4. тип в TypeScript существует только до компиляции — в JS‑коде он стирается.
    if (typeof rawPayload.deviceId !== "string") {
        return res.status(http_statuses_1.HttpStatus.Unauthorized).json({
            error: `Improper refresh token format. Invalid deviceId type in refresh token.`,
        });
    }
    if (typeof rawPayload.iat !== "number" ||
        typeof rawPayload.exp !== "number") {
        return res.status(http_statuses_1.HttpStatus.Unauthorized).json({
            error: `Improper refresh token format. Invalid deviceId type in refresh token. Invalid iat/exp fields in refresh token.`,
        });
    }
    // теперь можем присвоить
    const payload = rawPayload;
    const decodedRefreshTokenData = yield jwt_service_1.jwtService.decodeRefreshToken(refreshToken);
    let sessionId;
    const sessionsList = yield query_repository_1.dataQueryRepository.utilGetAllSessionRecords();
    const iatToPass = new Date((decodedRefreshTokenData === null || decodedRefreshTokenData === void 0 ? void 0 : decodedRefreshTokenData.iat) * 1000);
    const expToPass = new Date((decodedRefreshTokenData === null || decodedRefreshTokenData === void 0 ? void 0 : decodedRefreshTokenData.exp) * 1000);
    // проверяем существует ли сессия
    try {
        sessionId = yield command_repository_1.dataCommandRepository.findSession(decodedRefreshTokenData === null || decodedRefreshTokenData === void 0 ? void 0 : decodedRefreshTokenData.userId, decodedRefreshTokenData === null || decodedRefreshTokenData === void 0 ? void 0 : decodedRefreshTokenData.deviceId, expToPass, iatToPass);
        // if (sessionId) {
        //     console.warn("Session found!!!");
        // }
        if (!sessionId) {
            return res.status(http_statuses_1.HttpStatus.Unauthorized).json({
                error: `Session doesnt exist or expired token`,
                requestData: {
                    userId: decodedRefreshTokenData === null || decodedRefreshTokenData === void 0 ? void 0 : decodedRefreshTokenData.userId,
                    deviceId: decodedRefreshTokenData === null || decodedRefreshTokenData === void 0 ? void 0 : decodedRefreshTokenData.deviceId,
                    expToPass: expToPass,
                    iatToPass: iatToPass,
                },
                metaData: sessionsList,
            });
        }
    }
    catch (error) {
        return res.status(http_statuses_1.HttpStatus.InternalServerError).json({
            error: "Internal server error during await dataCommandRepository.findSession call inside refreshTokenGuard",
        });
    }
    // const ifRefreshTokenInBlackList = await dataCommandRepository.checkIfRefreshTokenInBlackList(refreshToken);
    // if (ifRefreshTokenInBlackList)
    // {
    //     // ВОТ ТУТ НАДО БЫ ПЕРЕДАТЬ В АЙТИ БЕЗОПАСНОСТЬ? т.к. кто-то с уже занесенным в блэк лист и скорее всего перевыпущенным токеном снова пытается обновиться? Или в случае если у нас несколько устройств, то это нормальная ситуация и надо бы проверять еще и по айпишникам-мак адресам?
    //     return res.status(HttpStatus.Unauthorized).json({
    //         error: `Refresh token is in the black list`,
    //     });
    // }
    // присваиваем значения для передачи далее
    req.user = { userId: payload.userId };
    req.sessionId = sessionId;
    req.deviceId = decodedRefreshTokenData === null || decodedRefreshTokenData === void 0 ? void 0 : decodedRefreshTokenData.deviceId;
    return next();
});
exports.refreshTokenGuard = refreshTokenGuard;
