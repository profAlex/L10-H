import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../../common/http-statuses/http-statuses";
import { JwtAccessPayloadType } from "../../adapters/verification/payload-type";
import { jwtService } from "../../adapters/verification/jwt-service";

export const accessTokenGuard = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    if (!req.headers.authorization)
        return res.status(HttpStatus.Unauthorized).json({
            error: `Field req.headers.authorization has improper format`,
        });

    if (!req.headers.authorization.startsWith("Bearer "))
        return res.status(HttpStatus.Unauthorized).json({
            error: `Field req.headers.authorization has improper format`,
        });

    const sentAccessToken = req.headers.authorization.split(" ")[1];
    const payload: JwtAccessPayloadType | null =
        await jwtService.verifyAccessToken(sentAccessToken);

    if (!payload)
        return res.status(HttpStatus.Unauthorized).json({
            error: `Improper access token format`,
        });

    req.user = { userId: payload.userId };

    return next();
};
