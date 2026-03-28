"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const error_management_validation_middleware_1 = require("./validation-middleware/error-management-validation-middleware");
const UserInputModel_validation_middleware_1 = require("./validation-middleware/UserInputModel-validation-middleware");
const auth_router_description_1 = require("./router-handlers/auth-router-description");
const access_token_guard_1 = require("./guard-middleware/access-token-guard");
const auth_router_general_middleware_validator_1 = require("./validation-middleware/auth-router-general-middleware-validator");
const refresh_token_guard_1 = require("./guard-middleware/refresh-token-guard");
const ip_request_restriction_guard_1 = require("./guard-middleware/ip-request-restriction-guard");
exports.authRouter = (0, express_1.Router)();
// Try login user to the system
exports.authRouter.post("/login", ip_request_restriction_guard_1.ipRequestRestrictionGuard, UserInputModel_validation_middleware_1.loginInputModelValidation, error_management_validation_middleware_1.inputErrorManagementMiddleware, auth_router_description_1.attemptToLogin);
// Confirm registration
exports.authRouter.post("/registration-confirmation", ip_request_restriction_guard_1.ipRequestRestrictionGuard, auth_router_general_middleware_validator_1.registrationConfirmationValidator, error_management_validation_middleware_1.inputErrorManagementMiddleware, auth_router_description_1.registrationConfirmation);
// Registration in the system. Email with confirmation code will be send to passed email address
exports.authRouter.post("/registration", ip_request_restriction_guard_1.ipRequestRestrictionGuardForRegistration, UserInputModel_validation_middleware_1.userInputModelValidation, error_management_validation_middleware_1.inputErrorManagementMiddleware, auth_router_description_1.registrationAttemptByUser);
// Resend Registration confirmation email
exports.authRouter.post("/registration-email-resending", ip_request_restriction_guard_1.ipRequestRestrictionGuardForResending, auth_router_general_middleware_validator_1.registrationResentConfirmationValidator, error_management_validation_middleware_1.inputErrorManagementMiddleware, auth_router_description_1.resendRegistrationConfirmation);
// Get information about current user
exports.authRouter.get("/me", access_token_guard_1.accessTokenGuard, auth_router_description_1.provideUserInfo);
// Generate new pair of access and refresh tokens (in cookie client must send correct refreshToken that will be revoked after refreshing)
exports.authRouter.post("/refresh-token", refresh_token_guard_1.refreshTokenGuard, auth_router_description_1.refreshTokenOnDemand);
// In cookie client must send correct refreshToken that will be revoked
exports.authRouter.post("/logout", refresh_token_guard_1.refreshTokenGuard, auth_router_description_1.logoutOnDemand);
