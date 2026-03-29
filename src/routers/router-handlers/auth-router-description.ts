import { Request, Response } from "express";
import { AuthCommandService } from "../../service-layer(BLL)/auth-command-service";
import { CustomResult } from "../../common/result-type/result-type";
import { HttpStatus } from "../../common/http-statuses/http-statuses";
import {
    RequestWithBody,
    RequestWithUserId,
} from "../request-types/request-types";
import { UserIdType } from "../router-types/user-id-type";
import { dataQueryRepository } from "../../repository-layers/query-repository-layer/query-repository";
import { AuthLoginInputModel } from "../router-types/auth-login-input-model";
import { RegistrationUserInputModel } from "../router-types/auth-registration-input-model";
import { RegistrationConfirmationInput } from "../router-types/auth-registration-confirmation-input-model";
import { ResentRegistrationConfirmationInput } from "../router-types/auth-resent-registration-confirmation-input-model";
import { RotationPairToken } from "../../adapters/verification/auth-token-rotation-pair";
import { PasswordRecoveryInputModel } from "../router-types/auth-password-recovery-input-model";
import { NewPasswordRecoveryInputModel } from "../router-types/auth-new-password-recovery-input-model";

export class AuthHandler {
    constructor(protected authCommandService: AuthCommandService) {}

    public attemptToLogin = async (
        req: RequestWithBody<AuthLoginInputModel>,
        res: Response,
    ) => {
        const loginResult: CustomResult<RotationPairToken> =
            await this.authCommandService.loginUser(req, res);

        if (!loginResult.data) {
            console.error(
                "Error description: ",
                loginResult?.statusDescription,
                JSON.stringify(loginResult.errorsMessages),
            );

            return res
                .status(loginResult.statusCode)
                .send({ errorsMessages: loginResult.errorsMessages });
        }

        const { accessToken, refreshToken, relatedUserId } = loginResult.data;

        // записываем данные соданного рефреш-токена в объект res для передачи при возврате
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
        });

        return res.status(HttpStatus.Ok).send({ accessToken: accessToken });
    };

    public provideUserInfo = async (
        req: RequestWithUserId<UserIdType>,
        res: Response,
    ) => {
        if (!req.user) {
            console.error("req.user is not found");
            return res
                .status(HttpStatus.InternalServerError)
                .json({ errorsMessages: [{ field: "", message: "" }] });
        }

        const userId = req.user.userId;
        if (!userId) {
            console.error("userId inside req.user is undefined or null");
            return res
                .status(HttpStatus.InternalServerError)
                .json({ errorsMessages: [{ field: "", message: "" }] });
        }

        // ДОЛЖНО ИДТИ ЧЕРЕЗ СЕРВИС!
        const userInfo = await dataQueryRepository.findUserForMe(userId);
        return res.status(HttpStatus.Ok).send(userInfo);
    };

    public registrationConfirmation = async (
        req: RequestWithBody<RegistrationConfirmationInput>,
        res: Response,
    ) => {
        const confirmationResult: CustomResult =
            await this.authCommandService.confirmRegistrationCode(req.body);

        if (confirmationResult.statusCode !== HttpStatus.NoContent) {
            console.error(
                "Error description: ",
                confirmationResult?.statusDescription,
                JSON.stringify(confirmationResult.errorsMessages),
            );

            return res
                .status(confirmationResult.statusCode)
                .send({ errorsMessages: confirmationResult.errorsMessages });
        }

        return res.sendStatus(HttpStatus.NoContent);
    };



    public newPasswordRecoveryConfirmation = async (
        req: RequestWithBody<NewPasswordRecoveryInputModel>,
        res: Response,
    ) => {
        const confirmationResult: CustomResult =
            await this.authCommandService.newPasswordRecoveryConfirmation(req.body);

        if (confirmationResult.statusCode !== HttpStatus.NoContent) {
            console.error(
                "Error description: ",
                confirmationResult?.statusDescription,
                JSON.stringify(confirmationResult.errorsMessages),
            );

            return res
                .status(confirmationResult.statusCode)
                .send({ errorsMessages: confirmationResult.errorsMessages });
        }

        return res.sendStatus(HttpStatus.NoContent);
    };


    public registrationAttemptByUser = async (
        req: RequestWithBody<RegistrationUserInputModel>,
        res: Response,
    ) => {
        // const { loginOrEmail, password } = req.body;
        const registrationResult: CustomResult =
            await this.authCommandService.registerNewUser(req.body);

        if (
            registrationResult.statusCode !== HttpStatus.Ok &&
            registrationResult.statusCode !== HttpStatus.NoContent
        ) {
            // console.error(
            //     "Error description: ",
            //     registrationResult?.statusDescription,
            //     JSON.stringify(registrationResult.errorsMessages)
            // );
            console.warn(
                `"ERROR: ${registrationResult.statusCode} IN FIELD: ${registrationResult.errorsMessages[0].field} MESSAGE:  ${registrationResult.errorsMessages[0].message}`,
            );
            return res
                .status(registrationResult.statusCode)
                .send({ errorsMessages: registrationResult.errorsMessages });
        }

        return res.sendStatus(HttpStatus.NoContent);
    };

    public resendRegistrationConfirmation = async (
        req: RequestWithBody<ResentRegistrationConfirmationInput>,
        res: Response,
    ) => {
        const resentConfirmationResult: CustomResult =
            await this.authCommandService.resendConfirmRegistrationCode(
                req.body,
            );

        if (resentConfirmationResult.statusCode !== HttpStatus.NoContent) {
            console.error(
                "Error description: ",
                resentConfirmationResult?.statusDescription,
                JSON.stringify(resentConfirmationResult.errorsMessages),
            );

            return res
                .status(resentConfirmationResult.statusCode)
                .send({
                    errorsMessages: resentConfirmationResult.errorsMessages,
                });
        }

        return res.sendStatus(HttpStatus.NoContent);
    };

    public refreshTokenOnDemand = async (req: Request, res: Response) => {
        const pairOfTokens = await this.authCommandService.refreshTokenOnDemand(
            // req.cookies.refreshToken,
            req.deviceId!,
            req.user!.userId!,
            req.sessionId!,
        );
        // console.warn("!!!HERE!!!");

        if (!pairOfTokens.data) {
            console.error(
                "Error description: ",
                pairOfTokens?.statusDescription,
                JSON.stringify(pairOfTokens.errorsMessages),
            );

            return res
                .status(pairOfTokens.statusCode)
                .send({ errorsMessages: pairOfTokens.errorsMessages });
        }

        const accessToken = pairOfTokens.data.accessToken;
        const refreshToken = pairOfTokens.data.refreshToken;

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
        });
        return res.status(HttpStatus.Ok).send({ accessToken: accessToken });
    };

    public logoutOnDemand = async (req: Request, res: Response) => {
        // const oldRefreshToken = req.cookies.refreshToken;

        const logoutResult = await this.authCommandService.logoutOnDemand(
            // oldRefreshToken,
            req.user!.userId!,
            req.sessionId!,
        );

        if (logoutResult === null) {
            return res.sendStatus(HttpStatus.NoContent);
        } else if (logoutResult === undefined) {
            return res.sendStatus(HttpStatus.Unauthorized);
        }
    };

    public sendPasswordRecoveryInfo = async (
        req: RequestWithBody<PasswordRecoveryInputModel>,
        res: Response,
    ) => {
        const sentPasswordRecoveryResult: CustomResult =
            await this.authCommandService.sendPasswordRecoveryInfo(
                req.body,
            );

        if (sentPasswordRecoveryResult.statusCode !== HttpStatus.NoContent) {
            console.error(
                "Error description: ",
                sentPasswordRecoveryResult?.statusDescription,
                JSON.stringify(sentPasswordRecoveryResult.errorsMessages),
            );

            return res
                .status(sentPasswordRecoveryResult.statusCode)
                .send({
                    errorsMessages: sentPasswordRecoveryResult.errorsMessages,
                });
        }

        // даже в случае если такого адреса нет, чтобы не раскрывать информацию мы шлем 204
        return res.sendStatus(HttpStatus.NoContent);
    };
}

// export const attemptToLogin = async (
//     req: RequestWithBody<AuthLoginInputModel>,
//     res: Response,
// ) => {
//     const loginResult: CustomResult<RotationPairToken> =
//         await AuthCommandService.loginUser(req, res);
//
//     if (!loginResult.data) {
//         console.error(
//             "Error description: ",
//             loginResult?.statusDescription,
//             JSON.stringify(loginResult.errorsMessages),
//         );
//
//         return res
//             .status(loginResult.statusCode)
//             .send({ errorsMessages: loginResult.errorsMessages });
//     }
//
//     const { accessToken, refreshToken, relatedUserId } = loginResult.data;
//
//     // записываем данные соданного рефреш-токена в объект res для передачи при возврате
//     res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });
//
//     return res.status(HttpStatus.Ok).send({ accessToken: accessToken });
// };
//
// export const provideUserInfo = async (
//     req: RequestWithUserId<UserIdType>,
//     res: Response,
// ) => {
//     if (!req.user) {
//         console.error("req.user is not found");
//         return res
//             .status(HttpStatus.InternalServerError)
//             .json({ errorsMessages: [{ field: "", message: "" }] });
//     }
//
//     const userId = req.user.userId;
//     if (!userId) {
//         console.error("userId inside req.user is undefined or null");
//         return res
//             .status(HttpStatus.InternalServerError)
//             .json({ errorsMessages: [{ field: "", message: "" }] });
//     }
//
//     // ДОЛЖНО ИДТИ ЧЕРЕЗ СЕРВИС!
//     const userInfo = await dataQueryRepository.findUserForMe(userId);
//     return res.status(HttpStatus.Ok).send(userInfo);
// };
//
// export const registrationConfirmation = async (
//     req: RequestWithBody<RegistrationConfirmationInput>,
//     res: Response,
// ) => {
//     const confirmationResult: CustomResult =
//         await AuthCommandService.confirmRegistrationCode(req.body);
//
//     if (confirmationResult.statusCode !== HttpStatus.NoContent) {
//         console.error(
//             "Error description: ",
//             confirmationResult?.statusDescription,
//             JSON.stringify(confirmationResult.errorsMessages),
//         );
//
//         return res
//             .status(confirmationResult.statusCode)
//             .send({ errorsMessages: confirmationResult.errorsMessages });
//     }
//
//     return res.sendStatus(HttpStatus.NoContent);
// };
//
// export const registrationAttemptByUser = async (
//     req: RequestWithBody<RegistrationUserInputModel>,
//     res: Response,
// ) => {
//     // const { loginOrEmail, password } = req.body;
//     const registrationResult: CustomResult = await AuthCommandService.registerNewUser(
//         req.body,
//     );
//
//     if (
//         registrationResult.statusCode !== HttpStatus.Ok &&
//         registrationResult.statusCode !== HttpStatus.NoContent
//     ) {
//         // console.error(
//         //     "Error description: ",
//         //     registrationResult?.statusDescription,
//         //     JSON.stringify(registrationResult.errorsMessages)
//         // );
//         console.warn(
//             `"ERROR: ${registrationResult.statusCode} IN FIELD: ${registrationResult.errorsMessages[0].field} MESSAGE:  ${registrationResult.errorsMessages[0].message}`,
//         );
//         return res
//             .status(registrationResult.statusCode)
//             .send({ errorsMessages: registrationResult.errorsMessages });
//     }
//
//     return res.sendStatus(HttpStatus.NoContent);
// };
//
// export const resendRegistrationConfirmation = async (
//     req: RequestWithBody<ResentRegistrationConfirmationInput>,
//     res: Response,
// ) => {
//     const resentConfirmationResult: CustomResult =
//         await AuthCommandService.resendConfirmRegistrationCode(req.body);
//
//     if (resentConfirmationResult.statusCode !== HttpStatus.NoContent) {
//         console.error(
//             "Error description: ",
//             resentConfirmationResult?.statusDescription,
//             JSON.stringify(resentConfirmationResult.errorsMessages),
//         );
//
//         return res
//             .status(resentConfirmationResult.statusCode)
//             .send({ errorsMessages: resentConfirmationResult.errorsMessages });
//     }
//
//     return res.sendStatus(HttpStatus.NoContent);
// };
//
// export const refreshTokenOnDemand = async (req: Request, res: Response) => {
//     const pairOfTokens = await AuthCommandService.refreshTokenOnDemand(
//         // req.cookies.refreshToken,
//         req.deviceId!,
//         req.user!.userId!,
//         req.sessionId!,
//     );
//     // console.warn("!!!HERE!!!");
//
//     if (!pairOfTokens.data) {
//         console.error(
//             "Error description: ",
//             pairOfTokens?.statusDescription,
//             JSON.stringify(pairOfTokens.errorsMessages),
//         );
//
//         return res
//             .status(pairOfTokens.statusCode)
//             .send({ errorsMessages: pairOfTokens.errorsMessages });
//     }
//
//     const accessToken = pairOfTokens.data.accessToken;
//     const refreshToken = pairOfTokens.data.refreshToken;
//
//     res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });
//     return res.status(HttpStatus.Ok).send({ accessToken: accessToken });
// };
//
// export const logoutOnDemand = async (req: Request, res: Response) => {
//     // const oldRefreshToken = req.cookies.refreshToken;
//
//     const logoutResult = await AuthCommandService.logoutOnDemand(
//         // oldRefreshToken,
//         req.user!.userId!,
//         req.sessionId!,
//     );
//
//     if (logoutResult === null) {
//         return res.sendStatus(HttpStatus.NoContent);
//     } else if (logoutResult === undefined) {
//         return res.sendStatus(HttpStatus.Unauthorized);
//     }
// };
