import "reflect-metadata";
import { Container } from "inversify";

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
import { TYPES } from "./ioc-types";

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
    usersCommandRepository,
    usersQueryRepository,
    sessionsCommandRepository,
    bcryptService
);

export const usersCommandService = new UsersCommandService(usersCommandRepository);
export const usersQueryService = new UsersQueryService(usersQueryRepository);

export const securityDevicesCommandService = new SecurityDevicesCommandService(sessionsCommandRepository);

export const refreshTokenGuardInstance = new RefreshTokenGuard(sessionsCommandRepository);

export const usersHandler = new UsersHandler(usersCommandService, usersQueryService);
export const securityDevicesHandler = new SecurityDevicesHandler(securityDevicesCommandService);
export const authHandler = new AuthHandler(authService);





const container = new Container();

// --- 1. Репозитории (Data Access Layer) ---
container.bind(TYPES.SessionsCommandRepository).to(SessionsCommandRepository).inSingletonScope();
container.bind(TYPES.UsersQueryRepository).to(UsersQueryRepository).inSingletonScope();
container.bind(TYPES.UsersCommandRepository).to(UsersCommandRepository).inSingletonScope();

// --- 2. Сервисы (Business Logic Layer) ---
container.bind(TYPES.BcryptService).to(BcryptService).inSingletonScope();
container.bind(TYPES.AuthCommandService).to(AuthCommandService).inSingletonScope();
container.bind(TYPES.UsersCommandService).to(UsersCommandService).inSingletonScope();
container.bind(TYPES.UsersQueryService).to(UsersQueryService).inSingletonScope();
container.bind(TYPES.SecurityDevicesCommandService).to(SecurityDevicesCommandService).inSingletonScope();

// --- 3. Гварды и Мидлвары ---
container.bind(TYPES.RefreshTokenGuard).to(RefreshTokenGuard).inSingletonScope();

// --- 4. Хендлеры (Application Layer) ---
container.bind(TYPES.UsersHandler).to(UsersHandler).inSingletonScope();
container.bind(TYPES.SecurityDevicesHandler).to(SecurityDevicesHandler).inSingletonScope();
container.bind(TYPES.AuthHandler).to(AuthHandler).inSingletonScope();

export { container };