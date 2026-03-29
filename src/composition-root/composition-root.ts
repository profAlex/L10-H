import { AuthHandler } from "../routers/router-handlers/auth-router-description";
import { SessionsCommandRepository } from "../repository-layers/command-repository-layer/sessions-command-repository";
import { UsersQueryRepository } from "../repository-layers/query-repository-layer/users-query-repository";
import { AuthCommandService } from "../service-layer(BLL)/auth-command-service";
import { BcryptService } from "../adapters/authentication/bcrypt-service";
import { UsersHandler } from "../routers/router-handlers/user-router-description";
import { UsersCommandRepository } from "../repository-layers/command-repository-layer/users-command-repository";
import { UsersCommandService } from "../service-layer(BLL)/users-command-service";
import { UsersQueryService } from "../service-layer(BLL)/users-query-service";
import { SecurityDevicesHandler } from "../routers/router-handlers/security-devices-router-description";
import { SecurityDevicesCommandService } from "../service-layer(BLL)/security-devices-command-service";
import { RefreshTokenGuard } from "../routers/guard-middleware/refresh-token-guard";


// export const authService = new AuthCommandService(
//     new UsersQueryRepository(),
//     new SessionsCommandRepository(),
//     new BcryptService(),
// );

export const bcryptService = new BcryptService();

export const sessionsCommandRepository = new SessionsCommandRepository();
export const usersQueryRepository = new UsersQueryRepository();
export const usersCommandRepository = new UsersCommandRepository(bcryptService);

export const authService = new AuthCommandService(
    usersQueryRepository,
    sessionsCommandRepository,
    bcryptService
);

export const authHandler = new AuthHandler(authService);

export const usersCommandService = new UsersCommandService(usersCommandRepository);
export const usersQueryService = new UsersQueryService(usersQueryRepository);

export const usersHandler = new UsersHandler(usersCommandService, usersQueryService);

export const securityDevicesCommandService = new SecurityDevicesCommandService(sessionsCommandRepository);
export const securityDevicesHandler = new SecurityDevicesHandler(securityDevicesCommandService);

export const refreshTokenGuardInstance = new RefreshTokenGuard(sessionsCommandRepository);