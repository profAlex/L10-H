import jwt from "jsonwebtoken";
import { envConfig } from "../../config";
import { JwtAccessPayloadType, JwtRefreshPayloadType } from "./payload-type";
import { token } from "./token-type";
import { HttpStatus } from "../../common/http-statuses/http-statuses";
import { CustomResult } from "../../common/result-type/result-type";
import { AccessTokenModel } from "./auth-access-token-model";
import { RefreshTokenModel } from "./auth-refresh-token-model";

export const jwtService = {
    async createAccessToken(
        payload: JwtAccessPayloadType,
    ): Promise<CustomResult<AccessTokenModel>> {
        if (!payload.userId) {
            console.error("userID is missing");

            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription: "userID is missing",
                errorsMessages: [
                    {
                        field: "createAccessToken -> if (!payload.userId)",
                        message: "userId is empty",
                    },
                ],
            };
        }

        try {
            const resultedToken = jwt.sign(
                payload,
                envConfig.accessTokenSecret,
                {
                    expiresIn: envConfig.accessTokenLifetime,
                },
            );

            return {
                data: { accessToken: resultedToken },
                statusCode: HttpStatus.NoContent,
                errorsMessages: [{ field: null, message: null }],
            };
        } catch (e: unknown) {
            console.error("Can't sign accessToken with JWT service: ", e);
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription: "Can't sign accessToken with JWT service",
                errorsMessages: [
                    {
                        field: "inside async createAccessToken",
                        message: "Unknown error",
                    },
                ],
            };
        }
    },

    async createRefreshToken(
        payload: JwtRefreshPayloadType,
    ): Promise<CustomResult<{refreshToken: string}>> {
        if (!payload.userId) {
            console.error("userID is missing");

            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription: "userID is missing",
                errorsMessages: [
                    {
                        field: "createRefreshToken -> if (!payload.userId)",
                        message: "userId is empty",
                    },
                ],
            };
        }

        try {
            const resultedToken = jwt.sign(
                payload,
                envConfig.refreshTokenSecret,
                // {
                //     expiresIn: envConfig.refreshTokenLifetime,
                // },
            );

            return {
                data: { refreshToken: resultedToken },
                statusCode: HttpStatus.NoContent,
                errorsMessages: [{ field: null, message: null }],
            };
        } catch (e: unknown) {
            console.error("Can't sign refreshToken with JWT service: ", e);
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription: "Can't sign refreshToken with JWT service",
                errorsMessages: [
                    {
                        field: "inside async createRefreshToken",
                        message: "Unknown error",
                    },
                ],
            };
        }
    },

    async decodeRefreshToken(token: string): Promise<JwtRefreshPayloadType | null> {
        try {
            const decoded = jwt.decode(token);

            // Проверяем, что decoded — объект и не null
            if (!decoded || typeof decoded !== 'object') {
                return null;
            }

            // Проверяем наличие обязательных полей
            if ('iat' in decoded && 'exp' in decoded && 'deviceId' in decoded) {
                // Приводим к нужному типу (уверены, что структура соответствует)
                return decoded as JwtRefreshPayloadType;
            }

            return null;
        } catch (e: unknown) {
            console.error("Can't decode token with JWT service: ", e);
            return null;
        }
    },

    async verifyAccessToken(token: string): Promise<JwtAccessPayloadType | null> {
        try {
            const verified = jwt.verify(token, envConfig.accessTokenSecret);

            if (typeof verified === 'object' && verified !== null && !Array.isArray(verified)) {
                return verified as JwtAccessPayloadType;
            }

            return null;
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                switch (error.name) {
                    case "TokenExpiredError":
                        console.warn(
                            "Access JWT is expired. Date of expiration:",
                            (error as jwt.TokenExpiredError).expiredAt,
                        );
                        break;
                    default:
                        console.warn(
                            "Error with Access JWT:",
                            error.name,
                            error.message,
                        );
                }
                return null;
            } else {
                console.warn(
                    "Unknown error with JWT verification service: ",
                    error,
                );
                return null;
            }
        }
    },

    async verifyRefreshToken(token: string): Promise<JwtRefreshPayloadType | null> {
        try {
            const verified = jwt.verify(token, envConfig.refreshTokenSecret);

            if (!verified || typeof verified !== 'object') {
                return null;
            }

            if ('iat' in verified && 'exp' in verified && 'deviceId' in verified) {
                // Приводим к нужному типу (уверены, что структура соответствует)
                return verified as JwtRefreshPayloadType;
            }

            return null;
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                switch (error.name) {
                    case "TokenExpiredError":
                        console.warn(
                            "Refresh JWT is expired. Date of expiration:",
                            (error as jwt.TokenExpiredError).expiredAt,
                        );
                        break;
                    default:
                        console.warn(
                            "Error with Refresh JWT:",
                            error.name,
                            error.message,
                        );
                }
                return null;
            } else {
                console.warn(
                    "Unknown error with JWT verification service: ",
                    error,
                );
                return null;
            }
        }
    },
};
