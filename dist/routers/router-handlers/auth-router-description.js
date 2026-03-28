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
exports.logoutOnDemand = exports.refreshTokenOnDemand = exports.resendRegistrationConfirmation = exports.registrationAttemptByUser = exports.registrationConfirmation = exports.provideUserInfo = exports.attemptToLogin = void 0;
const auth_service_1 = require("../../service-layer(BLL)/auth-service");
const http_statuses_1 = require("../../common/http-statuses/http-statuses");
const query_repository_1 = require("../../repository-layers/query-repository-layer/query-repository");
const attemptToLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const loginResult = yield auth_service_1.authService.loginUser(req, res);
    if (!loginResult.data) {
        console.error("Error description: ", loginResult === null || loginResult === void 0 ? void 0 : loginResult.statusDescription, JSON.stringify(loginResult.errorsMessages));
        return res
            .status(loginResult.statusCode)
            .send({ errorsMessages: loginResult.errorsMessages });
    }
    const { accessToken, refreshToken, relatedUserId } = loginResult.data;
    // записываем данные соданного рефреш-токена в объект res для передачи при возврате
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });
    return res.status(http_statuses_1.HttpStatus.Ok).send({ accessToken: accessToken });
});
exports.attemptToLogin = attemptToLogin;
const provideUserInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.provideUserInfo = provideUserInfo;
const registrationConfirmation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const confirmationResult = yield auth_service_1.authService.confirmRegistrationCode(req.body);
    if (confirmationResult.statusCode !== http_statuses_1.HttpStatus.NoContent) {
        console.error("Error description: ", confirmationResult === null || confirmationResult === void 0 ? void 0 : confirmationResult.statusDescription, JSON.stringify(confirmationResult.errorsMessages));
        return res
            .status(confirmationResult.statusCode)
            .send({ errorsMessages: confirmationResult.errorsMessages });
    }
    return res.sendStatus(http_statuses_1.HttpStatus.NoContent);
});
exports.registrationConfirmation = registrationConfirmation;
const registrationAttemptByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const { loginOrEmail, password } = req.body;
    const registrationResult = yield auth_service_1.authService.registerNewUser(req.body);
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
exports.registrationAttemptByUser = registrationAttemptByUser;
const resendRegistrationConfirmation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const resentConfirmationResult = yield auth_service_1.authService.resendConfirmRegistrationCode(req.body);
    if (resentConfirmationResult.statusCode !== http_statuses_1.HttpStatus.NoContent) {
        console.error("Error description: ", resentConfirmationResult === null || resentConfirmationResult === void 0 ? void 0 : resentConfirmationResult.statusDescription, JSON.stringify(resentConfirmationResult.errorsMessages));
        return res
            .status(resentConfirmationResult.statusCode)
            .send({ errorsMessages: resentConfirmationResult.errorsMessages });
    }
    return res.sendStatus(http_statuses_1.HttpStatus.NoContent);
});
exports.resendRegistrationConfirmation = resendRegistrationConfirmation;
const refreshTokenOnDemand = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pairOfTokens = yield auth_service_1.authService.refreshTokenOnDemand(
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
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });
    return res.status(http_statuses_1.HttpStatus.Ok).send({ accessToken: accessToken });
});
exports.refreshTokenOnDemand = refreshTokenOnDemand;
const logoutOnDemand = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const oldRefreshToken = req.cookies.refreshToken;
    const logoutResult = yield auth_service_1.authService.logoutOnDemand(
    // oldRefreshToken,
    req.user.userId, req.sessionId);
    if (logoutResult === null) {
        return res.sendStatus(http_statuses_1.HttpStatus.NoContent);
    }
    else if (logoutResult === undefined) {
        return res.sendStatus(http_statuses_1.HttpStatus.Unauthorized);
    }
});
exports.logoutOnDemand = logoutOnDemand;
