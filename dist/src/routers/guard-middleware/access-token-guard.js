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
exports.accessTokenGuard = void 0;
const http_statuses_1 = require("../../common/http-statuses/http-statuses");
const jwt_service_1 = require("../../adapters/verification/jwt-service");
const accessTokenGuard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.headers.authorization)
        return res.status(http_statuses_1.HttpStatus.Unauthorized).json({
            error: `Field req.headers.authorization has improper format`,
        });
    if (!req.headers.authorization.startsWith("Bearer "))
        return res.status(http_statuses_1.HttpStatus.Unauthorized).json({
            error: `Field req.headers.authorization has improper format`,
        });
    const sentAccessToken = req.headers.authorization.split(" ")[1];
    const payload = yield jwt_service_1.jwtService.verifyAccessToken(sentAccessToken);
    if (!payload)
        return res.status(http_statuses_1.HttpStatus.Unauthorized).json({
            error: `Improper access token format`,
        });
    req.user = { userId: payload.userId };
    return next();
});
exports.accessTokenGuard = accessTokenGuard;
