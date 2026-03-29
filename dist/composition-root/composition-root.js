"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenGuardInstance = exports.securityDevicesHandler = exports.securityDevicesCommandService = exports.usersHandler = exports.usersQueryService = exports.usersCommandService = exports.authHandler = exports.authService = exports.usersCommandRepository = exports.usersQueryRepository = exports.sessionsCommandRepository = exports.bcryptService = void 0;
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
exports.authHandler = new auth_router_description_1.AuthHandler(exports.authService);
exports.usersCommandService = new users_command_service_1.UsersCommandService(exports.usersCommandRepository);
exports.usersQueryService = new users_query_service_1.UsersQueryService(exports.usersQueryRepository);
exports.usersHandler = new user_router_description_1.UsersHandler(exports.usersCommandService, exports.usersQueryService);
exports.securityDevicesCommandService = new security_devices_command_service_1.SecurityDevicesCommandService(exports.sessionsCommandRepository);
exports.securityDevicesHandler = new security_devices_router_description_1.SecurityDevicesHandler(exports.securityDevicesCommandService);
exports.refreshTokenGuardInstance = new refresh_token_guard_1.RefreshTokenGuard(exports.sessionsCommandRepository);
