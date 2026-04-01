"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = exports.TYPES = exports.authHandler = exports.securityDevicesHandler = exports.usersHandler = exports.refreshTokenGuardInstance = exports.securityDevicesCommandService = exports.usersQueryService = exports.usersCommandService = exports.authService = exports.usersCommandRepository = exports.usersQueryRepository = exports.sessionsCommandRepository = exports.bcryptService = void 0;
require("reflect-metadata");
const inversify_1 = require("inversify");
const auth_router_description_1 = require("../routers/router-handlers/auth-router-description");
const sessions_command_repository_1 = require("../repository-layers/command-repository-layer/sessions-command-repository");
const users_query_repository_1 = require("../repository-layers/query-repository-layer/users-query-repository");
const auth_command_service_1 = require("../service-layer(BLL)/auth-command-service");
const bcrypt_service_1 = require("../adapters/authentication/bcrypt-service");
const user_router_description_1 = require("../routers/router-handlers/user-router-description");
const users_command_repository_1 = require("../repository-layers/command-repository-layer/users-command-repository");
const users_command_service_1 = require("../service-layer(BLL)/users-command-service");
const users_query_service_1 = require("../service-layer(BLL)/users-query-service");
const security_devices_router_description_1 = require("../routers/router-handlers/security-devices-router-description");
const security_devices_command_service_1 = require("../service-layer(BLL)/security-devices-command-service");
const refresh_token_guard_1 = require("../routers/guard-middleware/refresh-token-guard");
// export const authService = new AuthCommandService(
//     new UsersQueryRepository(),
//     new SessionsCommandRepository(),
//     new BcryptService(),
// );
exports.bcryptService = new bcrypt_service_1.BcryptService();
exports.sessionsCommandRepository = new sessions_command_repository_1.SessionsCommandRepository();
exports.usersQueryRepository = new users_query_repository_1.UsersQueryRepository();
exports.usersCommandRepository = new users_command_repository_1.UsersCommandRepository(exports.bcryptService);
exports.authService = new auth_command_service_1.AuthCommandService(exports.usersCommandRepository, exports.usersQueryRepository, exports.sessionsCommandRepository, exports.bcryptService);
exports.usersCommandService = new users_command_service_1.UsersCommandService(exports.usersCommandRepository);
exports.usersQueryService = new users_query_service_1.UsersQueryService(exports.usersQueryRepository);
exports.securityDevicesCommandService = new security_devices_command_service_1.SecurityDevicesCommandService(exports.sessionsCommandRepository);
exports.refreshTokenGuardInstance = new refresh_token_guard_1.RefreshTokenGuard(exports.sessionsCommandRepository);
exports.usersHandler = new user_router_description_1.UsersHandler(exports.usersCommandService, exports.usersQueryService);
exports.securityDevicesHandler = new security_devices_router_description_1.SecurityDevicesHandler(exports.securityDevicesCommandService);
exports.authHandler = new auth_router_description_1.AuthHandler(exports.authService);
exports.TYPES = {
    // Services
    BcryptService: Symbol.for("BcryptService"),
    AuthCommandService: Symbol.for("AuthCommandService"),
    UsersCommandService: Symbol.for("UsersCommandService"),
    UsersQueryService: Symbol.for("UsersQueryService"),
    SecurityDevicesCommandService: Symbol.for("SecurityDevicesCommandService"),
    // Repositories
    SessionsCommandRepository: Symbol.for("SessionsCommandRepository"),
    UsersQueryRepository: Symbol.for("UsersQueryRepository"),
    UsersCommandRepository: Symbol.for("UsersCommandRepository"),
    // Handlers (Controller logic)
    UsersHandler: Symbol.for("UsersHandler"),
    SecurityDevicesHandler: Symbol.for("SecurityDevicesHandler"),
    AuthHandler: Symbol.for("AuthHandler"),
    // Guards / Middlewares
    RefreshTokenGuard: Symbol.for("RefreshTokenGuard"),
};
const container = new inversify_1.Container();
exports.container = container;
// --- 1. Репозитории (Data Access Layer) ---
container.bind(exports.TYPES.SessionsCommandRepository).to(sessions_command_repository_1.SessionsCommandRepository).inSingletonScope();
container.bind(exports.TYPES.UsersQueryRepository).to(users_query_repository_1.UsersQueryRepository).inSingletonScope();
container.bind(exports.TYPES.UsersCommandRepository).to(users_command_repository_1.UsersCommandRepository).inSingletonScope();
// --- 2. Сервисы (Business Logic Layer) ---
container.bind(exports.TYPES.BcryptService).to(bcrypt_service_1.BcryptService).inSingletonScope();
container.bind(exports.TYPES.AuthCommandService).to(auth_command_service_1.AuthCommandService).inSingletonScope();
container.bind(exports.TYPES.UsersCommandService).to(users_command_service_1.UsersCommandService).inSingletonScope();
container.bind(exports.TYPES.UsersQueryService).to(users_query_service_1.UsersQueryService).inSingletonScope();
container.bind(exports.TYPES.SecurityDevicesCommandService).to(security_devices_command_service_1.SecurityDevicesCommandService).inSingletonScope();
// --- 3. Гварды и Мидлвары ---
container.bind(exports.TYPES.RefreshTokenGuard).to(refresh_token_guard_1.RefreshTokenGuard).inSingletonScope();
// --- 4. Хендлеры (Application Layer) ---
container.bind(exports.TYPES.UsersHandler).to(user_router_description_1.UsersHandler).inSingletonScope();
container.bind(exports.TYPES.SecurityDevicesHandler).to(security_devices_router_description_1.SecurityDevicesHandler).inSingletonScope();
container.bind(exports.TYPES.AuthHandler).to(auth_router_description_1.AuthHandler).inSingletonScope();
