import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../../common/http-statuses/http-statuses";
import { jwtService } from "../../adapters/verification/jwt-service";
import { dataCommandRepository } from "../../repository-layers/command-repository-layer/command-repository";
import { JwtRefreshPayloadType } from "../../adapters/verification/payload-type";
import { ObjectId } from "mongodb";
import { dataQueryRepository } from "../../repository-layers/query-repository-layer/query-repository";
import { SessionsCommandRepository } from "../../repository-layers/command-repository-layer/sessions-command-repository";

export class RefreshTokenGuard {

    constructor(protected sessionsCommandRepository: SessionsCommandRepository) {};

    public refreshTokenGuard = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        const { refreshToken } = req.cookies || {}; // || {} введено для тех случаев если забыли например подключить cooke-parcer, тогда поля cookies в структуре req вообще будет отсутствовать и тогда undefined крашнет приложение

        if (!refreshToken) {
            return res.status(HttpStatus.Unauthorized).json({
                error: `Malformed refresh token, was not found.`,
            });
        }

        const rawPayload = await jwtService.verifyRefreshToken(refreshToken);

        if (!rawPayload) {
            return res.status(HttpStatus.Unauthorized).json({
                error: `Improper refresh token format`,
            });
        }

        // вызов jwtService.verifyRefreshToken() сам по себе не гарантирует, что в rawPayload
        // присутствуют все поля из JwtRefreshPayloadType, которые мы ожидаем
        // поэтому нужно добавлять явные проверки в рантайме

        if (!rawPayload.userId) {
            return res.status(HttpStatus.Unauthorized).json({
                error: `Improper refresh token format. Missing userId in refresh token.`,
            });
        }
        // Несмотря на предупреждение, проверка в рантайме необходима, потому что:
        // 1. JWT‑токен может быть подделан или изменён;
        // 2. токен может быть создан другой версией сервиса с другой структурой;
        // 3. данные могут быть повреждены при передаче;
        // 4. тип в TypeScript существует только до компиляции — в JS‑коде он стирается.
        if (typeof rawPayload.deviceId !== "string") {
            return res.status(HttpStatus.Unauthorized).json({
                error: `Improper refresh token format. Invalid deviceId type in refresh token.`,
            });
        }
        if (
            typeof rawPayload.iat !== "number" ||
            typeof rawPayload.exp !== "number"
        ) {
            return res.status(HttpStatus.Unauthorized).json({
                error: `Improper refresh token format. Invalid deviceId type in refresh token. Invalid iat/exp fields in refresh token.`,
            });
        }
        // теперь можем присвоить
        const payload: JwtRefreshPayloadType = rawPayload;

        const decodedRefreshTokenData =
            await jwtService.decodeRefreshToken(refreshToken);

        let sessionId: ObjectId | null;

        const sessionsList =
            await dataQueryRepository.utilGetAllSessionRecords();

        const iatToPass = new Date(decodedRefreshTokenData?.iat! * 1000);
        const expToPass = new Date(decodedRefreshTokenData?.exp! * 1000);

        // проверяем существует ли сессия
        try {
            sessionId = await this.sessionsCommandRepository.findSession(
                decodedRefreshTokenData?.userId!,
                decodedRefreshTokenData?.deviceId!,
                expToPass as Date,
                iatToPass as Date,
            );

            // if (sessionId) {
            //     console.warn("Session found!!!");
            // }

            if (!sessionId) {
                return res.status(HttpStatus.Unauthorized).json({
                    error: `Session doesnt exist or expired token`,
                    requestData: {
                        userId: decodedRefreshTokenData?.userId!,
                        deviceId: decodedRefreshTokenData?.deviceId!,
                        expToPass: expToPass as Date,
                        iatToPass: iatToPass as Date,
                    },
                    metaData: sessionsList,
                });
            }
        } catch (error) {
            return res.status(HttpStatus.InternalServerError).json({
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
        req.sessionId = sessionId!;
        req.deviceId = decodedRefreshTokenData?.deviceId;
        return next();
    };
}
