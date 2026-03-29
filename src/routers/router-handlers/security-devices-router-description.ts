import { Response } from "express";
import {
    RequestWithParamsAndSessionMetaData,
    RequestWithSessionMetaData,
} from "../request-types/request-types";
import { IdParamName } from "../util-enums/id-names";
import { HttpStatus } from "../../common/http-statuses/http-statuses";
import { SecurityDevicesCommandService } from "../../service-layer(BLL)/security-devices-command-service";
import { SessionMetaDataType } from "../router-types/user-id-type";
import { DeviceViewModel } from "../router-types/security-devices-device-view-model";

export class SecurityDevicesHandler {
    constructor(
        protected securityDevicesCommandService: SecurityDevicesCommandService,
    ) {}

    public removeSessionById = async (
        req: RequestWithParamsAndSessionMetaData<
            {
                [IdParamName.DeviceId]: string;
            },
            SessionMetaDataType
        >,
        res: Response,
    ) => {
        const result =
            await this.securityDevicesCommandService.removeSessionById(
                req.params[IdParamName.DeviceId],
            );

        if (result === undefined) {
            res.sendStatus(HttpStatus.NotFound);
        }

        res.sendStatus(HttpStatus.NoContent);
    };

    public removeAllButOneSession = async (
        req: RequestWithSessionMetaData<SessionMetaDataType>,
        res: Response,
    ) => {
        const result =
            await this.securityDevicesCommandService.removeAllButOneSession(
                req.sessionId!,
                req.user!.userId!,
            );

        if (result === undefined) {
            res.status(HttpStatus.InternalServerError).json({
                error: "Internal server error during await securityDevicesCommandService.removeAllButOneSession(req.sessionId!, req.user!.userId!) inside removeAllButOneSession",
            });
        }
        res.sendStatus(HttpStatus.NoContent);
    };

    public getDevicesList = async (
        req: RequestWithSessionMetaData<SessionMetaDataType>,
        res: Response,
    ) => {
        const activeDevicesList: Array<DeviceViewModel> =
            await this.securityDevicesCommandService.getActiveDevicesList(
                req.user!.userId!,
            );

        if (activeDevicesList === undefined) {
            res.status(HttpStatus.InternalServerError).json({
                error: "Internal server error during await securityDevicesCommandService.getActiveDevicesList(req.user!.userId!) inside getDevicesList",
            });
        }
        res.status(HttpStatus.Ok).send(activeDevicesList);
    };
}
