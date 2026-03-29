import { Router } from "express";
import { IdParamName } from "./util-enums/id-names";
import { validateDeviceId } from "./validation-middleware/security-device-deviceId-validation";
import { refreshTokenGuardInstance, securityDevicesHandler } from "../composition-root/composition-root";

export const securityDevicesRouter = Router();

securityDevicesRouter.delete(
    `/:${IdParamName.DeviceId}`,
    refreshTokenGuardInstance.refreshTokenGuard,
    validateDeviceId,
    securityDevicesHandler.removeSessionById,
);

securityDevicesRouter.delete(
    `/`,
    refreshTokenGuardInstance.refreshTokenGuard,
    securityDevicesHandler.removeAllButOneSession,
);

securityDevicesRouter.get(
    `/`,
    refreshTokenGuardInstance.refreshTokenGuard,
    securityDevicesHandler.getDevicesList,
);