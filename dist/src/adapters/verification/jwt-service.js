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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../config");
const http_statuses_1 = require("../../common/http-statuses/http-statuses");
exports.jwtService = {
    createAccessToken(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!payload.userId) {
                console.error("userID is missing");
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
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
                const resultedToken = jsonwebtoken_1.default.sign(payload, config_1.envConfig.accessTokenSecret, {
                    expiresIn: config_1.envConfig.accessTokenLifetime,
                });
                return {
                    data: { accessToken: resultedToken },
                    statusCode: http_statuses_1.HttpStatus.NoContent,
                    errorsMessages: [{ field: null, message: null }],
                };
            }
            catch (e) {
                console.error("Can't sign accessToken with JWT service: ", e);
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: "Can't sign accessToken with JWT service",
                    errorsMessages: [
                        {
                            field: "inside async createAccessToken",
                            message: "Unknown error",
                        },
                    ],
                };
            }
        });
    },
    createRefreshToken(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!payload.userId) {
                console.error("userID is missing");
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
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
                const resultedToken = jsonwebtoken_1.default.sign(payload, config_1.envConfig.refreshTokenSecret);
                return {
                    data: { refreshToken: resultedToken },
                    statusCode: http_statuses_1.HttpStatus.NoContent,
                    errorsMessages: [{ field: null, message: null }],
                };
            }
            catch (e) {
                console.error("Can't sign refreshToken with JWT service: ", e);
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: "Can't sign refreshToken with JWT service",
                    errorsMessages: [
                        {
                            field: "inside async createRefreshToken",
                            message: "Unknown error",
                        },
                    ],
                };
            }
        });
    },
    decodeRefreshToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const decoded = jsonwebtoken_1.default.decode(token);
                // Проверяем, что decoded — объект и не null
                if (!decoded || typeof decoded !== 'object') {
                    return null;
                }
                // Проверяем наличие обязательных полей
                if ('iat' in decoded && 'exp' in decoded && 'deviceId' in decoded) {
                    // Приводим к нужному типу (уверены, что структура соответствует)
                    return decoded;
                }
                return null;
            }
            catch (e) {
                console.error("Can't decode token with JWT service: ", e);
                return null;
            }
        });
    },
    verifyAccessToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const verified = jsonwebtoken_1.default.verify(token, config_1.envConfig.accessTokenSecret);
                if (typeof verified === 'object' && verified !== null && !Array.isArray(verified)) {
                    return verified;
                }
                return null;
            }
            catch (error) {
                if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                    switch (error.name) {
                        case "TokenExpiredError":
                            console.warn("Access JWT is expired. Date of expiration:", error.expiredAt);
                            break;
                        default:
                            console.warn("Error with Access JWT:", error.name, error.message);
                    }
                    return null;
                }
                else {
                    console.warn("Unknown error with JWT verification service: ", error);
                    return null;
                }
            }
        });
    },
    verifyRefreshToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const verified = jsonwebtoken_1.default.verify(token, config_1.envConfig.refreshTokenSecret);
                if (!verified || typeof verified !== 'object') {
                    return null;
                }
                if ('iat' in verified && 'exp' in verified && 'deviceId' in verified) {
                    // Приводим к нужному типу (уверены, что структура соответствует)
                    return verified;
                }
                return null;
            }
            catch (error) {
                if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                    switch (error.name) {
                        case "TokenExpiredError":
                            console.warn("Refresh JWT is expired. Date of expiration:", error.expiredAt);
                            break;
                        default:
                            console.warn("Error with Refresh JWT:", error.name, error.message);
                    }
                    return null;
                }
                else {
                    console.warn("Unknown error with JWT verification service: ", error);
                    return null;
                }
            }
        });
    },
};
