import "reflect-metadata";
import { inject, injectable } from "inversify";


import { Response } from "express";
import { BcryptService } from "../adapters/authentication/bcrypt-service";
import { CustomResult } from "../common/result-type/result-type";
import { HttpStatus } from "../common/http-statuses/http-statuses";
import { RegistrationUserInputModel } from "../routers/router-types/auth-registration-input-model";
import { dataCommandRepository } from "../repository-layers/command-repository-layer/command-repository";
import { RegistrationConfirmationInput } from "../routers/router-types/auth-registration-confirmation-input-model";
import {
    ResentRegistrationConfirmationInput
} from "../routers/router-types/auth-resent-registration-confirmation-input-model";
import { ObjectId } from "mongodb";
import { User } from "../common/classes/user-class";
import {
    emailExamples,
    mailerService
} from "../adapters/email-sender/mailer-service";
import { RotationPairToken } from "../adapters/verification/auth-token-rotation-pair";
import { createTokenPair } from "../adapters/verification/utility-token-pairs-creation";
import { RequestWithBody } from "../routers/request-types/request-types";
import { AuthLoginInputModel } from "../routers/router-types/auth-login-input-model";
import { UserSession } from "../common/classes/session-class";
import { envConfig } from "../config";
import { UsersQueryRepository } from "../repository-layers/query-repository-layer/users-query-repository";
import { SessionsCommandRepository } from "../repository-layers/command-repository-layer/sessions-command-repository";
import { PasswordRecoveryInputModel } from "../routers/router-types/auth-password-recovery-input-model";
import { NewPasswordRecoveryInputModel } from "../routers/router-types/auth-new-password-recovery-input-model";
import { UsersCommandRepository } from "../repository-layers/command-repository-layer/users-command-repository";
import { TYPES } from "../composition-root/ioc-types";

@injectable()
export class AuthCommandService {
    constructor(
        @inject(TYPES.UsersCommandRepository) protected usersCommandRepository: UsersCommandRepository,
        @inject(TYPES.UsersQueryRepository) protected usersQueryRepository: UsersQueryRepository,
        @inject(TYPES.SessionsCommandRepository) protected sessionsCommandRepository: SessionsCommandRepository,
        @inject(TYPES.BcryptService) protected bcryptService: BcryptService
    ) {
    }

    async loginUser(
        req: RequestWithBody<AuthLoginInputModel>,
        res: Response
    ): Promise<CustomResult<RotationPairToken>> {
        const { loginOrEmail, password } = req.body;

        // проверяем что пользователь с указанным логином/емейлом уже существует в базе
        const user =
            await this.usersQueryRepository.findByLoginOrEmail(loginOrEmail);

        if (!user) {
            return {
                data: null,
                statusCode: HttpStatus.Unauthorized,
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
        const isCorrectCredentials = await this.checkUserCredentials(
            password,
            user.passwordHash
        );

        if (isCorrectCredentials === false) {
            return {
                data: null,
                statusCode: HttpStatus.Unauthorized,
                statusDescription: "Wrong login or password",
                errorsMessages: [
                    {
                        field: "loginUser -> checkUserCredentials",
                        message: "Wrong login or password"
                    }
                ]
            };
        } else if (isCorrectCredentials === null) {
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription:
                    "Failed attempt to check credentials login or password",
                errorsMessages: [
                    {
                        field: "loginUser -> checkUserCredentials",
                        message:
                            "Failed attempt to check credentials login or password"
                    }
                ]
            };
        }

        // создаем мета данные для сессии
        const sessionObjectId = new ObjectId();
        const deviceName = req.get("User-Agent") || ""; // или req.headers['user-agent'] - обязательно с малыми, т.к. по стандарту http все приводится к строчным. Методы .get и .header же осуществляют приведение к строчным(маленьким) под капотом
        const deviceIp = req.ip || "";

        // создаем объект сессии
        const tempSession = new UserSession(
            sessionObjectId,
            user.id,
            deviceName,
            deviceIp
        );
        const sessionIat = tempSession.issuedAt;
        const sessionExp = tempSession.expiresAt;
        const sessionDeviceId = tempSession.deviceId;

        // здесь логика у нас следующая
        // - в любом случае создаем новую сессию со всеми присущими определенными идентификаторами и параметрами

        // создаем сессию в базе
        const isSuccessfulSessionCreated =
            await this.sessionsCommandRepository.createSession(tempSession);

        if (!isSuccessfulSessionCreated) {
            console.error(
                "Error inside loginUser -> this.sessionsCommandRepository.createSession(tempSession)"
            );
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription:
                    "Error inside loginUser -> this.sessionsCommandRepository.createSession(tempSession)",
                errorsMessages: [
                    {
                        field: "this.sessionsCommandRepository.createSession(tempSession)",
                        message: "Error while creating session"
                    }
                ]
            };
        }

        // создаем пару токенов
        const pairOfToken = await createTokenPair(
            user.id,
            sessionIat,
            sessionExp,
            sessionDeviceId
        );
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
    }

    // пробуем зарегистрировать возвращенный от юзера код подтверждения
    async confirmRegistrationCode(
        sentData: RegistrationConfirmationInput
    ): Promise<CustomResult> {
        try {
            return await this.usersCommandRepository.confirmRegistrationCode(
                sentData
            );
        } catch (error) {
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription:
                    "Unknown error in AuthCommandService -> confirmRegistrationCode",
                errorsMessages: [
                    {
                        field: "",
                        message: "Unknown error"
                    }
                ]
            };
        }
    }

    // пробуем сравнить присланный код-восстановления с имеющимся в базе и обновить хэш пароля
    async newPasswordRecoveryConfirmation(
        sentData: NewPasswordRecoveryInputModel
    ): Promise<CustomResult> {
        try {
            return await this.usersCommandRepository.confirmPasswordRecoveryCode(
                sentData
            );
        } catch (error) {
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription:
                    "Unknown error in AuthCommandService -> newPasswordRecoveryConfirmation",
                errorsMessages: [
                    {
                        field: "",
                        message: "Unknown error"
                    }
                ]
            };
        }
    }

    // пробуем зарегистрировать пользователя по его запросу (т.е. по запросу фронта)
    async registerNewUser(
        sentData: RegistrationUserInputModel
    ): Promise<CustomResult> {
        try {
            const ifUserLoginExists =
                await this.usersCommandRepository.findByLoginOrEmail(sentData.login);
            const ifUserEmailExists =
                await this.usersCommandRepository.findByLoginOrEmail(sentData.email);

            if (ifUserLoginExists) {
                return {
                    data: null,
                    statusCode: HttpStatus.BadRequest,
                    statusDescription:
                        "AuthCommandService -> registerNewUser -> if(ifUserLoginExists)",
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
                    statusCode: HttpStatus.BadRequest,
                    statusDescription:
                        "AuthCommandService -> registerNewUser -> if(ifUserEmailExists)",
                    errorsMessages: [
                        {
                            field: "email",
                            message: "Email or Login already exists!!!"
                        }
                    ]
                };
            }

            const passwordHash = await this.bcryptService.generateHash(
                sentData.password
            );

            if (!passwordHash) {
                return {
                    data: null,
                    statusCode: HttpStatus.InternalServerError,
                    statusDescription: "",
                    errorsMessages: [
                        {
                            field: "bcryptService.generateHash",
                            message: "Generating hash error"
                        }
                    ]
                };
            }

            const tempId = new ObjectId();

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

            const newUserEntry = new User(
                sentData.login,
                sentData.email,
                passwordHash,
                tempId
            );

            const newUserInsertionResult =
                await this.usersCommandRepository.registerNewUser(newUserEntry);

            if (newUserInsertionResult.statusCode !== HttpStatus.Ok) {
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

            const sendingResult =
                await mailerService.sendEmailWithCode(
                    "\"Alex St\" <geniusb198@yandex.ru>",
                    newUserEntry.email,
                    newUserEntry.emailConfirmation.confirmationCode,
                    emailExamples.registrationEmail
                );

            let status =
                "Sending went without problems, awaiting confirmation form user";
            if (!sendingResult) {
                console.error(
                    "Something went wrong while sending the registration email"
                );
                status =
                    "Something went wrong while sending the registration email";
            }

            // отправка результата что все ОК
            return {
                data: null,
                statusCode: HttpStatus.NoContent,
                statusDescription: status,
                errorsMessages: [
                    {
                        field: "",
                        message: ""
                    }
                ]
            };
        } catch (error) {
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription:
                    "Unknown error in AuthCommandService -> registerNewUser",
                errorsMessages: [
                    {
                        field: "",
                        message: "Unknown error"
                    }
                ]
            };
        }
    }

    // запрос на повторную отправку email с подтверждением регистрационного кода
    async resendConfirmRegistrationCode(
        sentData: ResentRegistrationConfirmationInput
    ): Promise<CustomResult> {
        try {
            // const allUsersList = await dataCommandRepository.findAllUsers();
            // console.log("DEBUG: ", allUsersList);

            const isUserInDatabase =
                await this.usersCommandRepository.findNotConfirmedByEmail(
                    sentData.email
                );

            if (!isUserInDatabase) {
                return {
                    data: null,
                    statusCode: HttpStatus.BadRequest,
                    statusDescription:
                        "AuthCommandService -> resendConfirmRegistrationCode -> if (!isUserInDatabase)",
                    errorsMessages: [
                        {
                            field: "email",
                            message: "Email doesn't exist or already confirmed"
                        }
                    ]
                };
            }

            return await this.usersCommandRepository.resendConfirmRegistrationCode(
                sentData,
                isUserInDatabase
            );
        } catch (error) {
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription:
                    "Unknown error in AuthCommandService -> resendConfirmRegistrationCode",
                errorsMessages: [
                    {
                        field: "",
                        message: "Unknown error"
                    }
                ]
            };
        }
    }

    // обновляет сессию, генерирует и возвращает два токена
    async refreshTokenOnDemand(
        deviceId: string,
        userId: string,
        sessionId: ObjectId
    ): Promise<CustomResult<RotationPairToken>> {
        // const sessionData = await findSessionByPrimaryKey(sessionId);
        // формируем новые даты exp и iat
        const currentTimeMs = Date.now();
        // Преобразуем в секунды с округлением вниз
        const timestampSeconds = Math.floor(currentTimeMs / 1000);
        // Создаём Date из округлённых секунд (будет кратно 1000 мс)
        const issuedAt = new Date(timestampSeconds * 1000);

        // Устанавливаем expiresAt на основе той же базовой временной метки
        const expiresAt = new Date(
            issuedAt.getTime() + envConfig.refreshTokenLifetime * 1000
        );

        // обновляем данные в базе сессий
        const isSessionUpdated =
            await this.sessionsCommandRepository.updateSession(
                expiresAt,
                issuedAt,
                sessionId
            );
        if (!isSessionUpdated) {
            console.error("Couldn't update session data");
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
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
        const pairOfToken = await createTokenPair(
            userId, // тоже что и sessionData!.userId,
            issuedAt,
            expiresAt,
            deviceId
        );
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
    }

    async logoutOnDemand(
        // oldRefreshToken: string,
        relatedUserId: string,
        sessionId: ObjectId
    ): Promise<undefined | null> {
        // const ifSucessfullyAddedToBlackList =
        //     await dataCommandRepository.addRefreshTokenInfoToBlackList({
        //         refreshToken: oldRefreshToken,
        //         relatedUserId: relatedUserId,
        //     });
        const ifLoggedOutSuccessfully =
            await this.sessionsCommandRepository.removeSessionBySessionId(
                sessionId
            );

        return ifLoggedOutSuccessfully;
    }

    async sendPasswordRecoveryInfo(
        sentData: PasswordRecoveryInputModel
    ): Promise<CustomResult> {
        try {
            // const allUsersList = await dataCommandRepository.findAllUsers();
            // console.log("DEBUG: ", allUsersList);

            const isUserInDatabase =
                await this.usersCommandRepository.findConfirmedByEmail(
                    sentData.email
                );

            if (!isUserInDatabase) {
                return {
                    data: null,
                    statusCode: HttpStatus.NoContent,
                    statusDescription:
                        "AuthCommandService -> sendPasswordRecoveryInfo -> if (!isUserInDatabase) ",
                    errorsMessages: [
                        {
                            field: "email",
                            message: "Email doesn't exist or already confirmed"
                        }
                    ]
                };
            }

            return await this.usersCommandRepository.sendPasswordRecoveryInfo(
                sentData,
                isUserInDatabase
            );
        } catch (error) {
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription:
                    "Unknown error in AuthCommandService -> sendPasswordRecoveryInfo",
                errorsMessages: [
                    {
                        field: "",
                        message: "Unknown error"
                    }
                ]
            };
        }

    }

    // вспомогательная функция
    async checkUserCredentials(
        password: string,
        passwordHash: string
    ): Promise<boolean | null> {
        return this.bcryptService.checkPassword(password, passwordHash);
    }
};


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
