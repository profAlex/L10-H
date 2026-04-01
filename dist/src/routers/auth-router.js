"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const error_management_validation_middleware_1 = require("./validation-middleware/error-management-validation-middleware");
const UserInputModel_validation_middleware_1 = require("./validation-middleware/UserInputModel-validation-middleware");
const access_token_guard_1 = require("./guard-middleware/access-token-guard");
const auth_router_general_middleware_validator_1 = require("./validation-middleware/auth-router-general-middleware-validator");
const ip_request_restriction_guard_1 = require("./guard-middleware/ip-request-restriction-guard");
const composition_root_1 = require("../composition-root/composition-root");
exports.authRouter = (0, express_1.Router)();
const authHandler = composition_root_1.container.get(composition_root_1.TYPES.AuthHandler); // в том файле где мы определяем руты там и импортируем определения классов, используемых в руте
// Try login user to the system
exports.authRouter.post("/login", ip_request_restriction_guard_1.ipRequestRestrictionGuard, UserInputModel_validation_middleware_1.loginInputModelValidation, error_management_validation_middleware_1.inputErrorManagementMiddleware, authHandler.attemptToLogin);
// Confirm registration
exports.authRouter.post("/registration-confirmation", ip_request_restriction_guard_1.ipRequestRestrictionGuard, auth_router_general_middleware_validator_1.registrationConfirmationValidator, error_management_validation_middleware_1.inputErrorManagementMiddleware, authHandler.registrationConfirmation);
// Registration in the system. Email with confirmation code will be send to passed email address
exports.authRouter.post("/registration", ip_request_restriction_guard_1.ipRequestRestrictionGuardForRegistration, UserInputModel_validation_middleware_1.userInputModelValidation, error_management_validation_middleware_1.inputErrorManagementMiddleware, authHandler.registrationAttemptByUser);
// Resend Registration confirmation email
exports.authRouter.post("/registration-email-resending", ip_request_restriction_guard_1.ipRequestRestrictionGuardForResending, auth_router_general_middleware_validator_1.registrationResentConfirmationValidator, error_management_validation_middleware_1.inputErrorManagementMiddleware, authHandler.resendRegistrationConfirmation);
// Get information about current user
exports.authRouter.get("/me", access_token_guard_1.accessTokenGuard, authHandler.provideUserInfo);
// Generate new pair of access and refresh tokens (in cookie client must send
// correct refreshToken that will be revoked after refreshing)
exports.authRouter.post("/refresh-token", composition_root_1.refreshTokenGuardInstance.refreshTokenGuard, authHandler.refreshTokenOnDemand);
// In cookie client must send correct refreshToken that will be revoked
exports.authRouter.post("/logout", composition_root_1.refreshTokenGuardInstance.refreshTokenGuard, authHandler.logoutOnDemand);
// Password recovery via Email confirmation. Email should be sent with RecoveryCode inside
exports.authRouter.post("/password-recovery", ip_request_restriction_guard_1.ipRequestRestrictionGuardForResending, auth_router_general_middleware_validator_1.registrationResentConfirmationValidator, error_management_validation_middleware_1.inputErrorManagementMiddleware, authHandler.sendPasswordRecoveryInfo);
// Confirm Password recovery code and changing password
exports.authRouter.post("/new-password", ip_request_restriction_guard_1.ipRequestRestrictionGuard, auth_router_general_middleware_validator_1.recoveryCodeValidator, error_management_validation_middleware_1.inputErrorManagementMiddleware, authHandler.newPasswordRecoveryConfirmation);
