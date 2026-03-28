import { Request, Response, NextFunction } from "express";
import {
    RequestWithParams,
    RequestWithParamsAndSessionMetaData,
} from "../request-types/request-types";
import { IdParamName } from "../util-enums/id-names";
import { HttpStatus } from "../../common/http-statuses/http-statuses";
import { sessionsDataStorage } from "../../db/mongo.db";
import { SessionMetaDataType } from "../router-types/user-id-type";

export const validateDeviceId = async (
    req: RequestWithParamsAndSessionMetaData<
        {
            [IdParamName.DeviceId]: string;
        },
        SessionMetaDataType
    >,
    res: Response,
    next: NextFunction,
) => {
    const sentDeviceId = req.params[IdParamName.DeviceId];

    // такого нет в swagger, этого случая не описано
    if (!sentDeviceId) {
        return res.status(HttpStatus.BadRequest).json({
            error: "deviceId parameter is required",
        });
    }

    try {
        const result = await sessionsDataStorage.findOne(
            {
                deviceId: sentDeviceId,
            },
            // { projection: { _id: 1 } },
        );

        if (!result) {
            return res.status(HttpStatus.NotFound).json({
                error: `deviceId ${sentDeviceId} not found`,
            });
        } else if (result.userId !== req.user!.userId) {
            // но при этом мы можем удалить другие deviceId принадлежащие этому же юзеру
            return res.status(HttpStatus.Forbidden).json({
                error: "Attempting to delete the deviceId of other user",
            });
        }
    } catch (err) {
        return res.status(HttpStatus.InternalServerError).json({
            error: "Internal server error during deviceId validation inside validateDeviceId",
        });
    }

    // а вот эта проверка ни о чем не говорит, мы можем с другого девайся удалить любой другой девайс того же юзера
    // if (sentDeviceId !== req.deviceId) {
    //     res.status(HttpStatus.NotFound).json({
    //         error: `deviceId sent in parameters - ${sentDeviceId} - is not found`,
    //     });
    // }

    next();
};
