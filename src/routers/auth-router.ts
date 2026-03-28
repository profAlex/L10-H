import { Router } from "express";
import { inputErrorManagementMiddleware } from "./validation-middleware/error-management-validation-middleware";
import {
    loginInputModelValidation,
    userInputModelValidation,
} from "./validation-middleware/UserInputModel-validation-middleware";
import {
    attemptToLogin, AuthHandler,
    logoutOnDemand,
    provideUserInfo,
    refreshTokenOnDemand,
    registrationAttemptByUser,
    registrationConfirmation,
    resendRegistrationConfirmation
} from "./router-handlers/auth-router-description";
import { accessTokenGuard } from "./guard-middleware/access-token-guard";
import {
    registrationConfirmationValidator,
    registrationResentConfirmationValidator,
} from "./validation-middleware/auth-router-general-middleware-validator";
import { refreshTokenGuard } from "./guard-middleware/refresh-token-guard";
import {
    ipRequestRestrictionGuard,
    ipRequestRestrictionGuardForRegistration, ipRequestRestrictionGuardForResending
} from "./guard-middleware/ip-request-restriction-guard";

export const authRouter = Router();
export const authHandler = new AuthHandler();

// Try login user to the system
authRouter.post(
    "/login",
    ipRequestRestrictionGuard,
    loginInputModelValidation,
    inputErrorManagementMiddleware,
    authHandler.attemptToLogin,
);

// Confirm registration
authRouter.post(
    "/registration-confirmation",
    ipRequestRestrictionGuard,
    registrationConfirmationValidator,
    inputErrorManagementMiddleware,
    registrationConfirmation,
);

// Registration in the system. Email with confirmation code will be send to passed email address
authRouter.post(
    "/registration",
    ipRequestRestrictionGuardForRegistration,
    userInputModelValidation,
    inputErrorManagementMiddleware,
    registrationAttemptByUser,
);

// Resend Registration confirmation email
authRouter.post(
    "/registration-email-resending",
    ipRequestRestrictionGuardForResending,
    registrationResentConfirmationValidator,
    inputErrorManagementMiddleware,
    resendRegistrationConfirmation,
);

// Get information about current user
authRouter.get("/me", accessTokenGuard, provideUserInfo);

// Generate new pair of access and refresh tokens (in cookie client must send correct refreshToken that will be revoked after refreshing)
authRouter.post("/refresh-token",
    refreshTokenGuard,
    refreshTokenOnDemand);

// In cookie client must send correct refreshToken that will be revoked
authRouter.post("/logout", refreshTokenGuard, logoutOnDemand);
