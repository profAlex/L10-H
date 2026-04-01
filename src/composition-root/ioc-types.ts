export const TYPES = {
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
