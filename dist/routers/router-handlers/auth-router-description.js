"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthHandler = void 0;
const http_statuses_1 = require("../../common/http-statuses/http-statuses");
const query_repository_1 = require("../../repository-layers/query-repository-layer/query-repository");
class AuthHandler {
    constructor(authCommandService) {
        this.authCommandService = authCommandService;
        this.attemptToLogin = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const loginResult = yield this.authCommandService.loginUser(req, res);
            if (!loginResult.data) {
                console.error("Error description: ", loginResult === null || loginResult === void 0 ? void 0 : loginResult.statusDescription, JSON.stringify(loginResult.errorsMessages));
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
            return res.status(http_statuses_1.HttpStatus.Ok).send({ accessToken: accessToken });
        });
        this.provideUserInfo = (req, res) => __awaiter(this, void 0, void 0, function* () {
            if (!req.user) {
                console.error("req.user is not found");
                return res
                    .status(http_statuses_1.HttpStatus.InternalServerError)
                    .json({ errorsMessages: [{ field: "", message: "" }] });
            }
            const userId = req.user.userId;
            if (!userId) {
                console.error("userId inside req.user is undefined or null");
                return res
                    .status(http_statuses_1.HttpStatus.InternalServerError)
                    .json({ errorsMessages: [{ field: "", message: "" }] });
            }
            // ДОЛЖНО ИДТИ ЧЕРЕЗ СЕРВИС!
            const userInfo = yield query_repository_1.dataQueryRepository.findUserForMe(userId);
            return res.status(http_statuses_1.HttpStatus.Ok).send(userInfo);
        });
        this.registrationConfirmation = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const confirmationResult = yield this.authCommandService.confirmRegistrationCode(req.body);
            if (confirmationResult.statusCode !== http_statuses_1.HttpStatus.NoContent) {
                console.error("Error description: ", confirmationResult === null || confirmationResult === void 0 ? void 0 : confirmationResult.statusDescription, JSON.stringify(confirmationResult.errorsMessages));
                return res
                    .status(confirmationResult.statusCode)
                    .send({ errorsMessages: confirmationResult.errorsMessages });
            }
            return res.sendStatus(http_statuses_1.HttpStatus.NoContent);
        });
        this.newPasswordRecoveryConfirmation = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const confirmationResult = yield this.authCommandService.newPasswordRecoveryConfirmation(req.body);
            if (confirmationResult.statusCode !== http_statuses_1.HttpStatus.NoContent) {
                console.error("Error description: ", confirmationResult === null || confirmationResult === void 0 ? void 0 : confirmationResult.statusDescription, JSON.stringify(confirmationResult.errorsMessages));
                return res
                    .status(confirmationResult.statusCode)
                    .send({ errorsMessages: confirmationResult.errorsMessages });
            }
            return res.sendStatus(http_statuses_1.HttpStatus.NoContent);
        });
        this.registrationAttemptByUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            // const { loginOrEmail, password } = req.body;
            const registrationResult = yield this.authCommandService.registerNewUser(req.body);
            if (registrationResult.statusCode !== http_statuses_1.HttpStatus.Ok &&
                registrationResult.statusCode !== http_statuses_1.HttpStatus.NoContent) {
                // console.error(
                //     "Error description: ",
                //     registrationResult?.statusDescription,
                //     JSON.stringify(registrationResult.errorsMessages)
                // );
                console.warn(`"ERROR: ${registrationResult.statusCode} IN FIELD: ${registrationResult.errorsMessages[0].field} MESSAGE:  ${registrationResult.errorsMessages[0].message}`);
                return res
                    .status(registrationResult.statusCode)
                    .send({ errorsMessages: registrationResult.errorsMessages });
            }
            return res.sendStatus(http_statuses_1.HttpStatus.NoContent);
        });
        this.resendRegistrationConfirmation = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const resentConfirmationResult = yield this.authCommandService.resendConfirmRegistrationCode(req.body);
            if (resentConfirmationResult.statusCode !== http_statuses_1.HttpStatus.NoContent) {
                console.error("Error description: ", resentConfirmationResult === null || resentConfirmationResult === void 0 ? void 0 : resentConfirmationResult.statusDescription, JSON.stringify(resentConfirmationResult.errorsMessages));
                return res
                    .status(resentConfirmationResult.statusCode)
                    .send({
                    errorsMessages: resentConfirmationResult.errorsMessages,
                });
            }
            return res.sendStatus(http_statuses_1.HttpStatus.NoContent);
        });
        this.refreshTokenOnDemand = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const pairOfTokens = yield this.authCommandService.refreshTokenOnDemand(
            // req.cookies.refreshToken,
            req.deviceId, req.user.userId, req.sessionId);
            // console.warn("!!!HERE!!!");
            if (!pairOfTokens.data) {
                console.error("Error description: ", pairOfTokens === null || pairOfTokens === void 0 ? void 0 : pairOfTokens.statusDescription, JSON.stringify(pairOfTokens.errorsMessages));
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
            return res.status(http_statuses_1.HttpStatus.Ok).send({ accessToken: accessToken });
        });
        this.logoutOnDemand = (req, res) => __awaiter(this, void 0, void 0, function* () {
            // const oldRefreshToken = req.cookies.refreshToken;
            const logoutResult = yield this.authCommandService.logoutOnDemand(
            // oldRefreshToken,
            req.user.userId, req.sessionId);
            if (logoutResult === null) {
                return res.sendStatus(http_statuses_1.HttpStatus.NoContent);
            }
            else if (logoutResult === undefined) {
                return res.sendStatus(http_statuses_1.HttpStatus.Unauthorized);
            }
        });
        this.sendPasswordRecoveryInfo = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const sentPasswordRecoveryResult = yield this.authCommandService.sendPasswordRecoveryInfo(req.body);
            if (sentPasswordRecoveryResult.statusCode !== http_statuses_1.HttpStatus.NoContent) {
                console.error("Error description: ", sentPasswordRecoveryResult === null || sentPasswordRecoveryResult === void 0 ? void 0 : sentPasswordRecoveryResult.statusDescription, JSON.stringify(sentPasswordRecoveryResult.errorsMessages));
                return res
                    .status(sentPasswordRecoveryResult.statusCode)
                    .send({
                    errorsMessages: sentPasswordRecoveryResult.errorsMessages,
                });
            }
            // даже в случае если такого адреса нет, чтобы не раскрывать информацию мы шлем 204
            return res.sendStatus(http_statuses_1.HttpStatus.NoContent);
        });
    }
}
exports.AuthHandler = AuthHandler;
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
