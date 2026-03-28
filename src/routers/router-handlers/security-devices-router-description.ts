import { Response } from "express";
import {
    RequestWithParamsAndSessionMetaData,
    RequestWithSessionMetaData,
} from "../request-types/request-types";
import { IdParamName } from "../util-enums/id-names";
import { HttpStatus } from "../../common/http-statuses/http-statuses";
import { securityDevicesService } from "../../service-layer(BLL)/security-devices-service";
import { SessionMetaDataType } from "../router-types/user-id-type";
import { DeviceViewModel } from "../router-types/security-devices-device-view-model";

export const removeSessionById = async (
    req: RequestWithParamsAndSessionMetaData<
        {
            [IdParamName.DeviceId]: string;
        },
        SessionMetaDataType
    >,
    res: Response,
) => {
    const result = await securityDevicesService.removeSessionById(
        req.params[IdParamName.DeviceId],
    );

    if (result === undefined) {
        res.sendStatus(HttpStatus.NotFound);
    }

    res.sendStatus(HttpStatus.NoContent);
};

export const removeAllButOneSession = async (
    req: RequestWithSessionMetaData<SessionMetaDataType>,
    res: Response,
) => {
    const result = await securityDevicesService.removeAllButOneSession(
        req.sessionId!,
        req.user!.userId!,
    );

    if (result === undefined) {
        res.status(HttpStatus.InternalServerError).json({
            error: "Internal server error during await securityDevicesService.removeAllButOneSession(req.sessionId!, req.user!.userId!) inside removeAllButOneSession",
        });
    }
    res.sendStatus(HttpStatus.NoContent);
};

export const getDevicesList = async (
    req: RequestWithSessionMetaData<SessionMetaDataType>,
    res: Response,
) => {
    const activeDevicesList: Array<DeviceViewModel> =
        await securityDevicesService.getActiveDevicesList(req.user!.userId!);

    if (activeDevicesList === undefined) {
        res.status(HttpStatus.InternalServerError).json({
            error: "Internal server error during await securityDevicesService.getActiveDevicesList(req.user!.userId!) inside getDevicesList",
        });
    }
    res.status(HttpStatus.Ok).send(activeDevicesList);
};
