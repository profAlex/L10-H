import { Router } from "express";
import { IdParamName } from "./util-enums/id-names";
import { refreshTokenGuard } from "./guard-middleware/refresh-token-guard";
import { validateDeviceId } from "./validation-middleware/security-device-deviceId-validation";
import {
    getDevicesList,
    removeAllButOneSession,
    removeSessionById
} from "./router-handlers/security-devices-router-description";

export const securityDevicesRouter = Router();

securityDevicesRouter.delete(
    `/:${IdParamName.DeviceId}`,
    refreshTokenGuard,
    validateDeviceId,
    removeSessionById,
);

securityDevicesRouter.delete(
    `/`,
    refreshTokenGuard,
    removeAllButOneSession,
);

securityDevicesRouter.get(
    `/`,
    refreshTokenGuard,
    getDevicesList,
);