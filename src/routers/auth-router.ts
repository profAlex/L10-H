import { Router } from "express";
import { inputErrorManagementMiddleware } from "./validation-middleware/error-management-validation-middleware";
import {
    loginInputModelValidation,
    userInputModelValidation,
} from "./validation-middleware/UserInputModel-validation-middleware";
// import {
//     attemptToLogin, AuthHandler,
//     logoutOnDemand,
//     provideUserInfo,
//     refreshTokenOnDemand,
//     registrationAttemptByUser,
//     registrationConfirmation,
//     resendRegistrationConfirmation
// } from "./router-handlers/auth-router-description";
import { accessTokenGuard } from "./guard-middleware/access-token-guard";
import {
    recoveryCodeValidator,
    registrationConfirmationValidator,
    registrationResentConfirmationValidator
} from "./validation-middleware/auth-router-general-middleware-validator";
import {
    ipRequestRestrictionGuard,
    ipRequestRestrictionGuardForRegistration, ipRequestRestrictionGuardForResending
} from "./guard-middleware/ip-request-restriction-guard";
import { authHandler, refreshTokenGuardInstance } from "../composition-root/composition-root";

export const authRouter = Router();


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
    authHandler.registrationConfirmation,
);

// Registration in the system. Email with confirmation code will be send to passed email address
authRouter.post(
    "/registration",
    ipRequestRestrictionGuardForRegistration,
    userInputModelValidation,
    inputErrorManagementMiddleware,
    authHandler.registrationAttemptByUser,
);

// Resend Registration confirmation email
authRouter.post(
    "/registration-email-resending",
    ipRequestRestrictionGuardForResending,
    registrationResentConfirmationValidator,
    inputErrorManagementMiddleware,
    authHandler.resendRegistrationConfirmation,
);

// Get information about current user
authRouter.get("/me", accessTokenGuard, authHandler.provideUserInfo);

// Generate new pair of access and refresh tokens (in cookie client must send
// correct refreshToken that will be revoked after refreshing)
authRouter.post("/refresh-token",
    refreshTokenGuardInstance.refreshTokenGuard,
    authHandler.refreshTokenOnDemand);

// In cookie client must send correct refreshToken that will be revoked
authRouter.post("/logout", refreshTokenGuardInstance.refreshTokenGuard, authHandler.logoutOnDemand);

// Password recovery via Email confirmation. Email should be sent with RecoveryCode inside
authRouter.post(
    "/password-recovery",
    ipRequestRestrictionGuardForResending,
    registrationResentConfirmationValidator,
    inputErrorManagementMiddleware,
    authHandler.sendPasswordRecoveryInfo,
);

// Confirm Password recovery code and changing password
authRouter.post(
    "/new-password",
    ipRequestRestrictionGuard,
    recoveryCodeValidator,
    inputErrorManagementMiddleware,
    authHandler.newPasswordRecoveryConfirmation,
);