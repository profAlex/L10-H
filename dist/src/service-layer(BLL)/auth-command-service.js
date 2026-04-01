"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
exports.AuthCommandService = void 0;
require("reflect-metadata");
const inversify_1 = require("inversify");
const composition_root_1 = require("../composition-root/composition-root");
const bcrypt_service_1 = require("../adapters/authentication/bcrypt-service");
const http_statuses_1 = require("../common/http-statuses/http-statuses");
const mongodb_1 = require("mongodb");
const user_class_1 = require("../common/classes/user-class");
const mailer_service_1 = require("../adapters/email-sender/mailer-service");
const utility_token_pairs_creation_1 = require("../adapters/verification/utility-token-pairs-creation");
const session_class_1 = require("../common/classes/session-class");
const config_1 = require("../config");
const users_query_repository_1 = require("../repository-layers/query-repository-layer/users-query-repository");
const sessions_command_repository_1 = require("../repository-layers/command-repository-layer/sessions-command-repository");
const users_command_repository_1 = require("../repository-layers/command-repository-layer/users-command-repository");
let AuthCommandService = class AuthCommandService {
    constructor(usersCommandRepository, usersQueryRepository, sessionsCommandRepository, bcryptService) {
        this.usersCommandRepository = usersCommandRepository;
        this.usersQueryRepository = usersQueryRepository;
        this.sessionsCommandRepository = sessionsCommandRepository;
        this.bcryptService = bcryptService;
    }
    loginUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { loginOrEmail, password } = req.body;
            // проверяем что пользователь с указанным логином/емейлом уже существует в базе
            const user = yield this.usersQueryRepository.findByLoginOrEmail(loginOrEmail);
            if (!user) {
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.Unauthorized,
                    statusDescription: "Wrong login or password", // по сути это "User does not exist", но на фронт такие детали не должны утекать
                    errorsMessages: [
                        {
                            field: "dataQueryRepository.findByLoginOrEmail", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                            message: "Wrong login or password"
                        }
                    ]
                };
            }
            // если существует - проверяем что пароль верен
            const isCorrectCredentials = yield this.checkUserCredentials(password, user.passwordHash);
            if (isCorrectCredentials === false) {
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.Unauthorized,
                    statusDescription: "Wrong login or password",
                    errorsMessages: [
                        {
                            field: "loginUser -> checkUserCredentials",
                            message: "Wrong login or password"
                        }
                    ]
                };
            }
            else if (isCorrectCredentials === null) {
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: "Failed attempt to check credentials login or password",
                    errorsMessages: [
                        {
                            field: "loginUser -> checkUserCredentials",
                            message: "Failed attempt to check credentials login or password"
                        }
                    ]
                };
            }
            // создаем мета данные для сессии
            const sessionObjectId = new mongodb_1.ObjectId();
            const deviceName = req.get("User-Agent") || ""; // или req.headers['user-agent'] - обязательно с малыми, т.к. по стандарту http все приводится к строчным. Методы .get и .header же осуществляют приведение к строчным(маленьким) под капотом
            const deviceIp = req.ip || "";
            // создаем объект сессии
            const tempSession = new session_class_1.UserSession(sessionObjectId, user.id, deviceName, deviceIp);
            const sessionIat = tempSession.issuedAt;
            const sessionExp = tempSession.expiresAt;
            const sessionDeviceId = tempSession.deviceId;
            // здесь логика у нас следующая
            // - в любом случае создаем новую сессию со всеми присущими определенными идентификаторами и параметрами
            // создаем сессию в базе
            const isSuccessfulSessionCreated = yield this.sessionsCommandRepository.createSession(tempSession);
            if (!isSuccessfulSessionCreated) {
                console.error("Error inside loginUser -> this.sessionsCommandRepository.createSession(tempSession)");
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: "Error inside loginUser -> this.sessionsCommandRepository.createSession(tempSession)",
                    errorsMessages: [
                        {
                            field: "this.sessionsCommandRepository.createSession(tempSession)",
                            message: "Error while creating session"
                        }
                    ]
                };
            }
            // создаем пару токенов
            const pairOfToken = yield (0, utility_token_pairs_creation_1.createTokenPair)(user.id, sessionIat, sessionExp, sessionDeviceId);
            if (!pairOfToken.data) {
                console.error(pairOfToken.statusDescription);
                return {
                    data: null,
                    statusCode: pairOfToken.statusCode,
                    statusDescription: pairOfToken.statusDescription,
                    errorsMessages: pairOfToken.errorsMessages
                };
            }
            return pairOfToken;
        });
    }
    // пробуем зарегистрировать возвращенный от юзера код подтверждения
    confirmRegistrationCode(sentData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.usersCommandRepository.confirmRegistrationCode(sentData);
            }
            catch (error) {
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: "Unknown error in AuthCommandService -> confirmRegistrationCode",
                    errorsMessages: [
                        {
                            field: "",
                            message: "Unknown error"
                        }
                    ]
                };
            }
        });
    }
    // пробуем сравнить присланный код-восстановления с имеющимся в базе и обновить хэш пароля
    newPasswordRecoveryConfirmation(sentData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.usersCommandRepository.confirmPasswordRecoveryCode(sentData);
            }
            catch (error) {
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: "Unknown error in AuthCommandService -> newPasswordRecoveryConfirmation",
                    errorsMessages: [
                        {
                            field: "",
                            message: "Unknown error"
                        }
                    ]
                };
            }
        });
    }
    // пробуем зарегистрировать пользователя по его запросу (т.е. по запросу фронта)
    registerNewUser(sentData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ifUserLoginExists = yield this.usersCommandRepository.findByLoginOrEmail(sentData.login);
                const ifUserEmailExists = yield this.usersCommandRepository.findByLoginOrEmail(sentData.email);
                if (ifUserLoginExists) {
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.BadRequest,
                        statusDescription: "AuthCommandService -> registerNewUser -> if(ifUserLoginExists)",
                        errorsMessages: [
                            {
                                field: "AuthCommandService -> registerNewUser -> if(ifUserLoginExists)",
                                message: "Email or Login already exists!!!"
                            }
                        ]
                    };
                }
                if (ifUserEmailExists) {
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.BadRequest,
                        statusDescription: "AuthCommandService -> registerNewUser -> if(ifUserEmailExists)",
                        errorsMessages: [
                            {
                                field: "email",
                                message: "Email or Login already exists!!!"
                            }
                        ]
                    };
                }
                const passwordHash = yield this.bcryptService.generateHash(sentData.password);
                if (!passwordHash) {
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.InternalServerError,
                        statusDescription: "",
                        errorsMessages: [
                            {
                                field: "bcryptService.generateHash",
                                message: "Generating hash error"
                            }
                        ]
                    };
                }
                const tempId = new mongodb_1.ObjectId();
                // console.log(
                //     "REGISTERED NEW HERE <-------------",
                //     tempId.toString()
                // );
                // нижеследующее заменили на инициализацию через клас User через extend interface UserCollectionStorageModel
                // const newUserEntry = {
                //     _id: tempId,
                //     id: tempId.toString(),
                //     login: sentNewUser.login,
                //     email: sentNewUser.email,
                //     passwordHash: passwordHash,
                //     createdAt: new Date(),
                // } as UserCollectionStorageModel;
                const newUserEntry = new user_class_1.User(sentData.login, sentData.email, passwordHash, tempId);
                const newUserInsertionResult = yield this.usersCommandRepository.registerNewUser(newUserEntry);
                if (newUserInsertionResult.statusCode !== http_statuses_1.HttpStatus.Ok) {
                    return {
                        data: newUserInsertionResult.data,
                        statusCode: newUserInsertionResult.statusCode,
                        statusDescription: newUserInsertionResult.statusDescription,
                        errorsMessages: newUserInsertionResult.errorsMessages
                    };
                }
                // здесь отсылка письма. с точки зрения обработки потенциальных ошибок
                // максимум того что целесообразно сделать, это в том случае если по какой-то причине с нашей стороны чтото сломалось
                // никак не говорить об этом юзерам, пускай они самостоятельно повторно отправляют запрос, мы максимум логируем ошибку
                // тут жестко будет связано с политикой компании по этому поводу
                // так делается чтобы не брать на себя лишней работы, т.к. в случае реальной проблемы с сервисом отправки мы так или иначе будем это чинить
                // а если письмо просто потерялось или юзер тупит - для нас это может быть куча лишней работы по обслуживанию непонятно чего
                // так что во втором случае пусть юзер сам лучше на себя возьмет это работу - просто повторно отправит если что запррос, нам главно оптимально подобрать период удалления неподтвержденных данных (минут 15-30)
                const sendingResult = yield mailer_service_1.mailerService.sendEmailWithCode("\"Alex St\" <geniusb198@yandex.ru>", newUserEntry.email, newUserEntry.emailConfirmation.confirmationCode, mailer_service_1.emailExamples.registrationEmail);
                let status = "Sending went without problems, awaiting confirmation form user";
                if (!sendingResult) {
                    console.error("Something went wrong while sending the registration email");
                    status =
                        "Something went wrong while sending the registration email";
                }
                // отправка результата что все ОК
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.NoContent,
                    statusDescription: status,
                    errorsMessages: [
                        {
                            field: "",
                            message: ""
                        }
                    ]
                };
            }
            catch (error) {
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: "Unknown error in AuthCommandService -> registerNewUser",
                    errorsMessages: [
                        {
                            field: "",
                            message: "Unknown error"
                        }
                    ]
                };
            }
        });
    }
    // запрос на повторную отправку email с подтверждением регистрационного кода
    resendConfirmRegistrationCode(sentData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const allUsersList = await dataCommandRepository.findAllUsers();
                // console.log("DEBUG: ", allUsersList);
                const isUserInDatabase = yield this.usersCommandRepository.findNotConfirmedByEmail(sentData.email);
                if (!isUserInDatabase) {
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.BadRequest,
                        statusDescription: "AuthCommandService -> resendConfirmRegistrationCode -> if (!isUserInDatabase)",
                        errorsMessages: [
                            {
                                field: "email",
                                message: "Email doesn't exist or already confirmed"
                            }
                        ]
                    };
                }
                return yield this.usersCommandRepository.resendConfirmRegistrationCode(sentData, isUserInDatabase);
            }
            catch (error) {
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: "Unknown error in AuthCommandService -> resendConfirmRegistrationCode",
                    errorsMessages: [
                        {
                            field: "",
                            message: "Unknown error"
                        }
                    ]
                };
            }
        });
    }
    // обновляет сессию, генерирует и возвращает два токена
    refreshTokenOnDemand(deviceId, userId, sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            // const sessionData = await findSessionByPrimaryKey(sessionId);
            // формируем новые даты exp и iat
            const currentTimeMs = Date.now();
            // Преобразуем в секунды с округлением вниз
            const timestampSeconds = Math.floor(currentTimeMs / 1000);
            // Создаём Date из округлённых секунд (будет кратно 1000 мс)
            const issuedAt = new Date(timestampSeconds * 1000);
            // Устанавливаем expiresAt на основе той же базовой временной метки
            const expiresAt = new Date(issuedAt.getTime() + config_1.envConfig.refreshTokenLifetime * 1000);
            // обновляем данные в базе сессий
            const isSessionUpdated = yield this.sessionsCommandRepository.updateSession(expiresAt, issuedAt, sessionId);
            if (!isSessionUpdated) {
                console.error("Couldn't update session data");
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: "Couldn't update session data",
                    errorsMessages: [
                        {
                            field: "AuthCommandService -> refreshTokenOnDemand -> this.sessionsCommandRepository.updateSession(expiresAt, issuedAt, sessionId)",
                            message: "Couldn't update session data"
                        }
                    ]
                };
            }
            // создаем новые токены
            const pairOfToken = yield (0, utility_token_pairs_creation_1.createTokenPair)(userId, // тоже что и sessionData!.userId,
            issuedAt, expiresAt, deviceId);
            if (!pairOfToken.data) {
                console.error(pairOfToken.statusDescription);
                return {
                    data: null,
                    statusCode: pairOfToken.statusCode,
                    statusDescription: pairOfToken.statusDescription,
                    errorsMessages: pairOfToken.errorsMessages
                };
            }
            // const createdAtOldToken =
            //     await jwtService.decodeRefreshToken(refreshToken);
            //
            // const ifSucessfullyAddedToBlackList =
            //     await dataCommandRepository.addRefreshTokenInfoToBlackList({
            //         refreshToken: refreshToken,
            //         relatedUserId: userId,
            //         createdAt: createdAtOldToken?.iat,
            //     });
            //
            // if (!ifSucessfullyAddedToBlackList) {
            //     console.error(
            //         "Couldn't insert outdated refresh token into the blacklist",
            //     );
            //     return {
            //         data: null,
            //         statusCode: HttpStatus.InternalServerError,
            //         statusDescription:
            //             "Couldn't insert outdated refresh token into the blacklist",
            //         errorsMessages: [
            //             {
            //                 field: "AuthCommandService -> refreshTokenOnDemand -> if (!ifSucessfullyAddedToBlackList)",
            //                 message:
            //                     "Couldn't insert outdated refresh token into the blacklist",
            //             },
            //         ],
            //     };
            // }
            return pairOfToken;
        });
    }
    logoutOnDemand(
    // oldRefreshToken: string,
    relatedUserId, sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            // const ifSucessfullyAddedToBlackList =
            //     await dataCommandRepository.addRefreshTokenInfoToBlackList({
            //         refreshToken: oldRefreshToken,
            //         relatedUserId: relatedUserId,
            //     });
            const ifLoggedOutSuccessfully = yield this.sessionsCommandRepository.removeSessionBySessionId(sessionId);
            return ifLoggedOutSuccessfully;
        });
    }
    sendPasswordRecoveryInfo(sentData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const allUsersList = await dataCommandRepository.findAllUsers();
                // console.log("DEBUG: ", allUsersList);
                const isUserInDatabase = yield this.usersCommandRepository.findConfirmedByEmail(sentData.email);
                if (!isUserInDatabase) {
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.NoContent,
                        statusDescription: "AuthCommandService -> sendPasswordRecoveryInfo -> if (!isUserInDatabase) ",
                        errorsMessages: [
                            {
                                field: "email",
                                message: "Email doesn't exist or already confirmed"
                            }
                        ]
                    };
                }
                return yield this.usersCommandRepository.sendPasswordRecoveryInfo(sentData, isUserInDatabase);
            }
            catch (error) {
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: "Unknown error in AuthCommandService -> sendPasswordRecoveryInfo",
                    errorsMessages: [
                        {
                            field: "",
                            message: "Unknown error"
                        }
                    ]
                };
            }
        });
    }
    // вспомогательная функция
    checkUserCredentials(password, passwordHash) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.bcryptService.checkPassword(password, passwordHash);
        });
    }
};
exports.AuthCommandService = AuthCommandService;
exports.AuthCommandService = AuthCommandService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(composition_root_1.TYPES.UsersCommandRepository)),
    __param(1, (0, inversify_1.inject)(composition_root_1.TYPES.UsersQueryRepository)),
    __param(2, (0, inversify_1.inject)(composition_root_1.TYPES.SessionsCommandRepository)),
    __param(3, (0, inversify_1.inject)(composition_root_1.TYPES.BcryptService)),
    __metadata("design:paramtypes", [users_command_repository_1.UsersCommandRepository,
        users_query_repository_1.UsersQueryRepository,
        sessions_command_repository_1.SessionsCommandRepository,
        bcrypt_service_1.BcryptService])
], AuthCommandService);
;
// export const AuthCommandService = {
//     async loginUser(
//         req: RequestWithBody<AuthLoginInputModel>,
//         res: Response,
//     ): Promise<CustomResult<RotationPairToken>> {
//         const { loginOrEmail, password } = req.body;
//
//         // проверяем что пользователь с указанным логином/емейлом уже существует в базе
//         const user = await usersQueryRepository.findByLoginOrEmail(loginOrEmail);
//
//         if (!user) {
//             return {
//                 data: null,
//                 statusCode: HttpStatus.Unauthorized,
//                 statusDescription: "Wrong login or password", // по сути это "User does not exist", но на фронт такие детали не должны утекать
//                 errorsMessages: [
//                     {
//                         field: "dataQueryRepository.findByLoginOrEmail", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
//                         message: "Wrong login or password",
//                     },
//                 ],
//             };
//         }
//
//         // если существует - проверяем что пароль верен
//         const isCorrectCredentials = await this.checkUserCredentials(
//             password,
//             user.passwordHash,
//         );
//
//         if (isCorrectCredentials === false) {
//             return {
//                 data: null,
//                 statusCode: HttpStatus.Unauthorized,
//                 statusDescription: "Wrong login or password",
//                 errorsMessages: [
//                     {
//                         field: "loginUser -> checkUserCredentials",
//                         message: "Wrong login or password",
//                     },
//                 ],
//             };
//         } else if (isCorrectCredentials === null) {
//             return {
//                 data: null,
//                 statusCode: HttpStatus.InternalServerError,
//                 statusDescription:
//                     "Failed attempt to check credentials login or password",
//                 errorsMessages: [
//                     {
//                         field: "loginUser -> checkUserCredentials",
//                         message:
//                             "Failed attempt to check credentials login or password",
//                     },
//                 ],
//             };
//         }
//
//         // создаем мета данные для сессии
//         const sessionObjectId = new ObjectId();
//         const deviceName = req.get("User-Agent") || ""; // или req.headers['user-agent'] - обязательно с малыми, т.к. по стандарту http все приводится к строчным. Методы .get и .header же осуществляют приведение к строчным(маленьким) под капотом
//         const deviceIp = req.ip || "";
//
//         // создаем объект сессии
//         const tempSession = new UserSession(
//             sessionObjectId,
//             user.id,
//             deviceName,
//             deviceIp,
//         );
//         const sessionIat = tempSession.issuedAt;
//         const sessionExp = tempSession.expiresAt;
//         const sessionDeviceId = tempSession.deviceId;
//
//         // здесь логика у нас следующая
//         // - в любом случае создаем новую сессию со всеми присущими определенными идентификаторами и параметрами
//
//         // создаем сессию в базе
//         const isSuccessfulSessionCreated =
//             await sessionsCommandRepository.createSession(tempSession);
//
//         if (!isSuccessfulSessionCreated) {
//             console.error(
//                 "Error inside loginUser -> dataCommandRepository.createSession(tempSession)",
//             );
//             return {
//                 data: null,
//                 statusCode: HttpStatus.InternalServerError,
//                 statusDescription:
//                     "Error inside loginUser -> dataCommandRepository.createSession(tempSession)",
//                 errorsMessages: [
//                     {
//                         field: "dataCommandRepository.createSession(tempSession)",
//                         message: "Error while creating session",
//                     },
//                 ],
//             };
//         }
//
//         // создаем пару токенов
//         const pairOfToken = await createTokenPair(
//             user.id,
//             sessionIat,
//             sessionExp,
//             sessionDeviceId,
//         );
//         if (!pairOfToken.data) {
//             console.error(pairOfToken.statusDescription);
//             return {
//                 data: null,
//                 statusCode: pairOfToken.statusCode,
//                 statusDescription: pairOfToken.statusDescription,
//                 errorsMessages: pairOfToken.errorsMessages,
//             };
//         }
//
//         return pairOfToken;
//     },
//
//     // пробуем зарегистрировать возвращенный от юзера код подтверждения
//     async confirmRegistrationCode(
//         sentData: RegistrationConfirmationInput,
//     ): Promise<CustomResult> {
//         try {
//             return await dataCommandRepository.confirmRegistrationCode(
//                 sentData,
//             );
//         } catch (error) {
//             return {
//                 data: null,
//                 statusCode: HttpStatus.InternalServerError,
//                 statusDescription:
//                     "Unknown error in AuthCommandService -> confirmRegistrationCode",
//                 errorsMessages: [
//                     {
//                         field: "",
//                         message: "Unknown error",
//                     },
//                 ],
//             };
//         }
//     },
//
//     // пробуем зарегистрировать пользователя по его запросу (т.е. по запросу фронта)
//     async registerNewUser(
//         sentData: RegistrationUserInputModel,
//     ): Promise<CustomResult> {
//         try {
//             const ifUserLoginExists =
//                 await dataCommandRepository.findByLoginOrEmail(sentData.login);
//             const ifUserEmailExists =
//                 await dataCommandRepository.findByLoginOrEmail(sentData.email);
//
//             if (ifUserLoginExists) {
//                 return {
//                     data: null,
//                     statusCode: HttpStatus.BadRequest,
//                     statusDescription:
//                         "AuthCommandService -> registerNewUser -> if(ifUserLoginExists)",
//                     errorsMessages: [
//                         {
//                             field: "AuthCommandService -> registerNewUser -> if(ifUserLoginExists)",
//                             message: "Email or Login already exists!!!",
//                         },
//                     ],
//                 };
//             }
//             if (ifUserEmailExists) {
//                 return {
//                     data: null,
//                     statusCode: HttpStatus.BadRequest,
//                     statusDescription:
//                         "AuthCommandService -> registerNewUser -> if(ifUserEmailExists)",
//                     errorsMessages: [
//                         {
//                             field: "email",
//                             message: "Email or Login already exists!!!",
//                         },
//                     ],
//                 };
//             }
//
//             const passwordHash = await bcryptService.generateHash(
//                 sentData.password,
//             );
//
//             if (!passwordHash) {
//                 return {
//                     data: null,
//                     statusCode: HttpStatus.InternalServerError,
//                     statusDescription: "",
//                     errorsMessages: [
//                         {
//                             field: "bcryptService.generateHash",
//                             message: "Generating hash error",
//                         },
//                     ],
//                 };
//             }
//
//             const tempId = new ObjectId();
//
//             // console.log(
//             //     "REGISTERED NEW HERE <-------------",
//             //     tempId.toString()
//             // );
//             // нижеследующее заменили на инициализацию через клас User через extend interface UserCollectionStorageModel
//             // const newUserEntry = {
//             //     _id: tempId,
//             //     id: tempId.toString(),
//             //     login: sentNewUser.login,
//             //     email: sentNewUser.email,
//             //     passwordHash: passwordHash,
//             //     createdAt: new Date(),
//             // } as UserCollectionStorageModel;
//
//             const newUserEntry = new User(
//                 sentData.login,
//                 sentData.email,
//                 passwordHash,
//                 tempId,
//             );
//
//             const newUserInsertionResult =
//                 await dataCommandRepository.registerNewUser(newUserEntry);
//
//             if (newUserInsertionResult.statusCode !== HttpStatus.Ok) {
//                 return {
//                     data: newUserInsertionResult.data,
//                     statusCode: newUserInsertionResult.statusCode,
//                     statusDescription: newUserInsertionResult.statusDescription,
//                     errorsMessages: newUserInsertionResult.errorsMessages,
//                 };
//             }
//
//             // здесь отсылка письма. с точки зрения обработки потенциальных ошибок
//             // максимум того что целесообразно сделать, это в том случае если по какой-то причине с нашей стороны чтото сломалось
//             // никак не говорить об этом юзерам, пускай они самостоятельно повторно отправляют запрос, мы максимум логируем ошибку
//             // тут жестко будет связано с политикой компании по этому поводу
//             // так делается чтобы не брать на себя лишней работы, т.к. в случае реальной проблемы с сервисом отправки мы так или иначе будем это чинить
//             // а если письмо просто потерялось или юзер тупит - для нас это может быть куча лишней работы по обслуживанию непонятно чего
//             // так что во втором случае пусть юзер сам лучше на себя возьмет это работу - просто повторно отправит если что запррос, нам главно оптимально подобрать период удалления неподтвержденных данных (минут 15-30)
//
//             const sendingResult =
//                 await mailerService.sendEmailWithCode(
//                     '"Alex St" <geniusb198@yandex.ru>',
//                     newUserEntry.email,
//                     newUserEntry.emailConfirmation.confirmationCode,
//                     emailExamples.registrationEmail,
//                 );
//
//             let status =
//                 "Sending went without problems, awaiting confirmation form user";
//             if (!sendingResult) {
//                 console.error(
//                     "Something went wrong while sending the registration email",
//                 );
//                 status =
//                     "Something went wrong while sending the registration email";
//             }
//
//             // отправка результата что все ОК
//             return {
//                 data: null,
//                 statusCode: HttpStatus.NoContent,
//                 statusDescription: status,
//                 errorsMessages: [
//                     {
//                         field: "",
//                         message: "",
//                     },
//                 ],
//             };
//         } catch (error) {
//             return {
//                 data: null,
//                 statusCode: HttpStatus.InternalServerError,
//                 statusDescription:
//                     "Unknown error in AuthCommandService -> registerNewUser",
//                 errorsMessages: [
//                     {
//                         field: "",
//                         message: "Unknown error",
//                     },
//                 ],
//             };
//         }
//     },
//
//     // запрос на повторную отправку email с подтверждением регистрационного кода
//     async resendConfirmRegistrationCode(
//         sentData: ResentRegistrationConfirmationInput,
//     ): Promise<CustomResult> {
//         try {
//
//             // const allUsersList = await dataCommandRepository.findAllUsers();
//             // console.log("DEBUG: ", allUsersList);
//
//             const isUserInDatabase =
//                 await dataCommandRepository.findNotConfirmedByEmail(
//                     sentData.email,
//                 );
//
//             if (!isUserInDatabase) {
//                 return {
//                     data: null,
//                     statusCode: HttpStatus.BadRequest,
//                     statusDescription:
//                         "AuthCommandService -> resendConfirmRegistrationCode -> if (isUserInDatabase)",
//                     errorsMessages: [
//                         {
//                             field: "email",
//                             message: "Email doesn't exist or already confirmed",
//                         },
//                     ],
//                 };
//             }
//
//             return await dataCommandRepository.resendConfirmRegistrationCode(
//                 sentData,
//                 isUserInDatabase,
//             );
//         } catch (error) {
//             return {
//                 data: null,
//                 statusCode: HttpStatus.InternalServerError,
//                 statusDescription:
//                     "Unknown error in AuthCommandService -> resendConfirmRegistrationCode",
//                 errorsMessages: [
//                     {
//                         field: "",
//                         message: "Unknown error",
//                     },
//                 ],
//             };
//         }
//     },
//
//     // обновляет сессию, генерирует и возвращает два токена
//     async refreshTokenOnDemand(
//         deviceId: string,
//         userId: string,
//         sessionId: ObjectId,
//     ): Promise<CustomResult<RotationPairToken>> {
//         // const sessionData = await findSessionByPrimaryKey(sessionId);
//         // формируем новые даты exp и iat
//         const currentTimeMs = Date.now();
//         // Преобразуем в секунды с округлением вниз
//         const timestampSeconds = Math.floor(currentTimeMs / 1000);
//         // Создаём Date из округлённых секунд (будет кратно 1000 мс)
//         const issuedAt = new Date(timestampSeconds * 1000);
//
//         // Устанавливаем expiresAt на основе той же базовой временной метки
//         const expiresAt = new Date(
//             issuedAt.getTime() + envConfig.refreshTokenLifetime * 1000,
//         );
//
//         // обновляем данные в базе сессий
//         const isSessionUpdated = await sessionsCommandRepository.updateSession(
//             expiresAt,
//             issuedAt,
//             sessionId,
//         );
//         if (!isSessionUpdated) {
//             console.error("Couldn't update session data");
//             return {
//                 data: null,
//                 statusCode: HttpStatus.InternalServerError,
//                 statusDescription: "Couldn't update session data",
//                 errorsMessages: [
//                     {
//                         field: "AuthCommandService -> refreshTokenOnDemand -> dataCommandRepository.updateSession(expiresAt, issuedAt, sessionId)",
//                         message: "Couldn't update session data",
//                     },
//                 ],
//             };
//         }
//
//         // создаем новые токены
//         const pairOfToken = await createTokenPair(
//             userId, // тоже что и sessionData!.userId,
//             issuedAt,
//             expiresAt,
//             deviceId,
//         );
//         if (!pairOfToken.data) {
//             console.error(pairOfToken.statusDescription);
//             return {
//                 data: null,
//                 statusCode: pairOfToken.statusCode,
//                 statusDescription: pairOfToken.statusDescription,
//                 errorsMessages: pairOfToken.errorsMessages,
//             };
//         }
//
//         // const createdAtOldToken =
//         //     await jwtService.decodeRefreshToken(refreshToken);
//         //
//         // const ifSucessfullyAddedToBlackList =
//         //     await dataCommandRepository.addRefreshTokenInfoToBlackList({
//         //         refreshToken: refreshToken,
//         //         relatedUserId: userId,
//         //         createdAt: createdAtOldToken?.iat,
//         //     });
//         //
//         // if (!ifSucessfullyAddedToBlackList) {
//         //     console.error(
//         //         "Couldn't insert outdated refresh token into the blacklist",
//         //     );
//         //     return {
//         //         data: null,
//         //         statusCode: HttpStatus.InternalServerError,
//         //         statusDescription:
//         //             "Couldn't insert outdated refresh token into the blacklist",
//         //         errorsMessages: [
//         //             {
//         //                 field: "AuthCommandService -> refreshTokenOnDemand -> if (!ifSucessfullyAddedToBlackList)",
//         //                 message:
//         //                     "Couldn't insert outdated refresh token into the blacklist",
//         //             },
//         //         ],
//         //     };
//         // }
//
//         return pairOfToken;
//     },
//
//     async logoutOnDemand(
//         // oldRefreshToken: string,
//         relatedUserId: string,
//         sessionId: ObjectId,
//     ): Promise<undefined | null> {
//         // const ifSucessfullyAddedToBlackList =
//         //     await dataCommandRepository.addRefreshTokenInfoToBlackList({
//         //         refreshToken: oldRefreshToken,
//         //         relatedUserId: relatedUserId,
//         //     });
//         const ifLoggedOutSuccessfully =
//             await sessionsCommandRepository.removeSessionBySessionId(sessionId);
//
//         return ifLoggedOutSuccessfully;
//     },
//
//     // вспомогательная функция
//     async checkUserCredentials(
//         password: string,
//         passwordHash: string,
//     ): Promise<boolean | null> {
//         return BcryptService.checkPassword(password, passwordHash);
//     },
// };
