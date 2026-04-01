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
exports.UsersCommandRepository = void 0;
require("reflect-metadata");
const inversify_1 = require("inversify");
const composition_root_1 = require("../../composition-root/composition-root");
const custom_error_class_1 = require("../utility/custom-error-class");
const user_class_1 = require("../../common/classes/user-class");
const bcrypt_service_1 = require("../../adapters/authentication/bcrypt-service");
const mongodb_1 = require("mongodb");
const mongo_db_1 = require("../../db/mongo.db");
const http_statuses_1 = require("../../common/http-statuses/http-statuses");
const mailer_service_1 = require("../../adapters/email-sender/mailer-service");
const node_crypto_1 = require("node:crypto");
let UsersCommandRepository = class UsersCommandRepository {
    constructor(bcryptService) {
        this.bcryptService = bcryptService;
    }
    createNewUser(sentNewUser) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const passwordHash = yield this.bcryptService.generateHash(sentNewUser.password);
                if (!passwordHash) {
                    throw new custom_error_class_1.CustomError({
                        errorMessage: {
                            field: "bcryptService.generateHash",
                            message: "Generating hash error",
                        },
                    });
                }
                const tempId = new mongodb_1.ObjectId();
                // нижеследующее заменили на инициализацию через клас User через extend interface UserCollectionStorageModel
                // const newUserEntry = {
                //     _id: tempId,
                //     id: tempId.toString(),
                //     login: sentNewUser.login,
                //     email: sentNewUser.email,
                //     passwordHash: passwordHash,
                //     createdAt: new Date(),
                // } as UserCollectionStorageModel;
                const newUserEntry = new user_class_1.User(sentNewUser.login, sentNewUser.email, passwordHash, tempId);
                newUserEntry.emailConfirmation.isConfirmed = true; // для созданных админом пользователей подтверждения не нужно
                const result = yield mongo_db_1.usersCollection.insertOne(newUserEntry);
                if (!result.acknowledged) {
                    throw new custom_error_class_1.CustomError({
                        errorMessage: {
                            field: "UsersCommandRepository -> createNewUser -> usersCollection.insertOne(newUserEntry)",
                            message: "attempt to insert new user entry failed",
                        },
                    });
                }
                return result.insertedId.toString();
            }
            catch (error) {
                if (error instanceof custom_error_class_1.CustomError) {
                    if (error.metaData) {
                        const errorData = error.metaData.errorMessage;
                        console.error(`In field: ${errorData.field} - ${errorData.message}`);
                    }
                    else {
                        console.error(`Unknown error: ${JSON.stringify(error)}`);
                    }
                    return undefined;
                }
                else {
                    console.error(`Unknown error: ${JSON.stringify(error)}`);
                    throw new Error("Placeholder for an error to be rethrown and dealt with in the future in createNewUser method of dataCommandRepository");
                }
            }
        });
    }
    deleteUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (mongodb_1.ObjectId.isValid(userId)) {
                    const idToCheck = new mongodb_1.ObjectId(userId);
                    const res = yield mongo_db_1.usersCollection.deleteOne({ _id: idToCheck });
                    if (!res.acknowledged) {
                        throw new custom_error_class_1.CustomError({
                            errorMessage: {
                                field: "usersCollection.deleteOne",
                                message: "attempt to delete user entry failed",
                            },
                        });
                    }
                    if (res.deletedCount === 1) {
                        return null;
                    }
                }
                else {
                    return undefined;
                }
            }
            catch (error) {
                if (error instanceof custom_error_class_1.CustomError) {
                    if (error.metaData) {
                        const errorData = error.metaData.errorMessage;
                        console.error(`In field: ${errorData.field} - ${errorData.message}`);
                    }
                    else {
                        console.error(`Unknown error: ${JSON.stringify(error)}`);
                    }
                    return undefined;
                }
                else {
                    console.error(`Unknown error inside UsersCommandRepository -> deleteUser: ${JSON.stringify(error)}`);
                    throw new Error("Placeholder for an error to be rethrown and dealt with in the future in deleteUser method of dataCommandRepository");
                }
            }
        });
    }
    confirmRegistrationCode(sentConfirmationData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const searchResult = await usersCollection
                //     .aggregate([
                //         {
                //             $match: {
                //                 "emailConfirmation.confirmationCode":
                //                     sentConfirmationData.code,
                //                 "emailConfirmation.expirationDate": {
                //                     $gt: new Date(),
                //                 },
                //                 "emailConfirmation.isConfirmed": false,
                //             },
                //         },
                //         {
                //             $project: {
                //                 _id: 1,
                //             },
                //         },
                //     ])
                //     .toArray();
                const searchResult = yield mongo_db_1.usersCollection.findOne({
                    "emailConfirmation.confirmationCode": sentConfirmationData.code,
                    "emailConfirmation.expirationDate": { $gt: new Date() },
                    "emailConfirmation.isConfirmed": false,
                }, { projection: { _id: 1 } });
                // console.log("ALL USERS: ", searchResult);
                // console.log(
                //     "ARRAY LENGTH HERE <-------------",
                //     searchResult.length
                // );
                //
                // console.log(
                //     "FOUND HERE <-------------",
                //     searchResult[0]._id.toString()
                // );
                // aggregate() всегда возвращает массив!
                if (searchResult) {
                    const updateResult = yield mongo_db_1.usersCollection.updateOne({ _id: searchResult._id }, {
                        $set: {
                            "emailConfirmation.confirmationCode": null,
                            "emailConfirmation.isConfirmed": true,
                        },
                    });
                    if (updateResult.acknowledged) {
                        return {
                            data: null,
                            statusCode: http_statuses_1.HttpStatus.NoContent,
                            statusDescription: "Successfully confirmed user",
                            errorsMessages: [
                                {
                                    field: "",
                                    message: "",
                                },
                            ],
                        };
                    }
                    // не смогли обновить юзера
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.InternalServerError,
                        statusDescription: "Couldn't confirm user: UsersCommandRepository -> confirmRegistrationCode",
                        errorsMessages: [
                            {
                                field: "",
                                message: "Couldn't confirm user",
                            },
                        ],
                    };
                }
                // юзер не был найден или просрочен
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.BadRequest,
                    statusDescription: "Couldn't confirm user: UsersCommandRepository -> confirmRegistrationCode",
                    errorsMessages: [
                        {
                            field: "code",
                            message: "Couldn't confirm user - not existent or out of date",
                        },
                    ],
                };
            }
            catch (error) {
                // непредвиденная ошибка
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: "UsersCommandRepository -> confirmRegistrationCode",
                    errorsMessages: [
                        {
                            field: "",
                            message: "Unknown error",
                        },
                    ],
                };
            }
        });
    }
    findConfirmedByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield mongo_db_1.usersCollection.findOne({
                    "emailConfirmation.isConfirmed": true,
                    email: email,
                }, { projection: { _id: 1 } });
                return user ? user._id : null;
            }
            catch (error) {
                // не оптимально, но пока не унифицирован подход к обработке ошибок - оставляем
                console.error("Internal DB error in UsersCommandRepository -> findConfirmedByEmail:", error);
                return null;
            }
        });
    }
    sendPasswordRecoveryInfo(sentEmailData, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // console.log(
                //     "<--------------",
                //     userId.toString()
                // );
                const userEntry = yield mongo_db_1.usersCollection.findOne({ _id: userId }); // очень важно!! обязательнь указывать поле по которому идет поиск! '_id:', без него может не найти, хотя ошибку синтаксически не покажет
                if (!userEntry) {
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.InternalServerError,
                        statusDescription: "",
                        errorsMessages: [
                            {
                                field: "UsersCommandRepository -> sendPasswordRecoveryInfo -> usersCollection.findOne({ userId })",
                                message: "User not found",
                            },
                        ],
                    };
                }
                const newRecoveryCode = (0, node_crypto_1.randomUUID)();
                const result = yield mongo_db_1.usersCollection.updateOne({ _id: userId }, {
                    $set: {
                        "passwordRecoveryInformation.passwordRecoveryCode": newRecoveryCode,
                        "passwordRecoveryInformation.expirationDate": new Date(new Date().setDate(new Date().getMinutes() + 3000)),
                        "passwordRecoveryInformation.isRecoveryInAction": true,
                    },
                });
                if (!result.acknowledged) {
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.InternalServerError,
                        statusDescription: "",
                        errorsMessages: [
                            {
                                field: "UsersCommandRepository -> sendPasswordRecoveryInfo -> usersCollection.updateOne",
                                message: "Attempt to update user entry failed",
                            },
                        ],
                    };
                }
                // здесь отсылка письма. с точки зрения обработки потенциальных ошибок
                // максимум того что целесообразно сделать, это в том случае если по какой-то причине с нашей стороны чтото сломалось
                // никак не говорить об этом юзерам, пускай они самостоятельно повторно отправляют запрос, мы максимум логируем ошибку
                // тут жестко будет связано с политикой компании по этому поводу
                // так делается чтобы не брать на себя лишней работы, т.к. в случае реальной проблемы с сервисом отправки мы так или иначе будем это чинить
                // а если письмо просто потерялось или юзер тупит - для нас это может быть куча лишней работы по обслуживанию непонятно чего
                // так что во втором случае пусть юзер сам лучше на себя возьмет это работу - просто повторно отправит если что запррос, нам главно оптимально подобрать период удалления неподтвержденных данных (минут 15-30)
                const sendingResult = yield mailer_service_1.mailerService.sendEmailWithCode('"Alex St" <geniusb198@yandex.ru>', sentEmailData.email, newRecoveryCode, mailer_service_1.emailExamples.passwordRecoveryEmail);
                let status = "Sending recovery email went without problems, awaiting confirmation form user";
                if (!sendingResult) {
                    console.error("Something went while sending the recovery email");
                    status =
                        "Something went wrong while sending the recovery email";
                }
                // отправка результата - все ОК
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.NoContent,
                    statusDescription: status,
                    errorsMessages: [
                        {
                            field: "",
                            message: "",
                        },
                    ],
                };
            }
            catch (error) {
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: "UsersCommandRepository -> sendPasswordRecoveryInfo",
                    errorsMessages: [
                        {
                            field: "",
                            message: "Unknown error",
                        },
                    ],
                };
            }
        });
    }
    confirmPasswordRecoveryCode(sentConfirmationData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const searchResult = await usersCollection
                //     .aggregate([
                //         {
                //             $match: {
                //                 "emailConfirmation.confirmationCode":
                //                     sentConfirmationData.code,
                //                 "emailConfirmation.expirationDate": {
                //                     $gt: new Date(),
                //                 },
                //                 "emailConfirmation.isConfirmed": false,
                //             },
                //         },
                //         {
                //             $project: {
                //                 _id: 1,
                //             },
                //         },
                //     ])
                //     .toArray();
                const searchResult = yield mongo_db_1.usersCollection.findOne({
                    "passwordRecoveryInformation.passwordRecoveryCode": sentConfirmationData.recoveryCode,
                    "passwordRecoveryInformation.expirationDate": { $gt: new Date() },
                    "passwordRecoveryInformation.isRecoveryInAction": true,
                }, { projection: { _id: 1 } });
                // console.log("ALL USERS: ", searchResult);
                // console.log(
                //     "ARRAY LENGTH HERE <-------------",
                //     searchResult.length
                // );
                //
                // console.log(
                //     "FOUND HERE <-------------",
                //     searchResult[0]._id.toString()
                // );
                // aggregate() всегда возвращает массив!
                if (searchResult) {
                    // если юзер с заданными характеристиками нашелся - генерируем новый хэш для пароля и пробуем обновить его
                    const newPasswordHash = yield this.bcryptService.generateHash(sentConfirmationData.newPassword);
                    if (!newPasswordHash) {
                        return {
                            data: null,
                            statusCode: http_statuses_1.HttpStatus.InternalServerError,
                            statusDescription: "Error inside UsersCommandRepository -> confirmPasswordRecoveryCode -> bcryptService.generateHash",
                            errorsMessages: [
                                {
                                    field: "bcryptService.generateHash",
                                    message: "Generating hash error"
                                }
                            ]
                        };
                    }
                    const updateResult = yield mongo_db_1.usersCollection.updateOne({ _id: searchResult._id }, {
                        $set: {
                            passwordHash: newPasswordHash,
                            "passwordRecoveryInformation.confirmationCode": null,
                            "passwordRecoveryInformation.isRecoveryInAction": false,
                        },
                    });
                    if (updateResult.acknowledged) {
                        return {
                            data: null,
                            statusCode: http_statuses_1.HttpStatus.NoContent,
                            statusDescription: "Successfully confirmed new password",
                            errorsMessages: [
                                {
                                    field: "",
                                    message: "",
                                },
                            ],
                        };
                    }
                    // не смогли обновить данные нового пароля
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.InternalServerError,
                        statusDescription: "Couldn't confirm new password: UsersCommandRepository -> confirmPasswordRecoveryCode",
                        errorsMessages: [
                            {
                                field: "",
                                message: "Couldn't confirm password",
                            },
                        ],
                    };
                }
                // юзер не был найден или просрочен
                // конкретно эта ошибка строго регламентирована в ТЗ, поле должно быть указано правильно: recoveryCode
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.BadRequest,
                    statusDescription: "Couldn't confirm new password: UsersCommandRepository -> confirmPasswordRecoveryCode",
                    errorsMessages: [
                        {
                            field: "recoveryCode",
                            message: "Couldn't confirm new password - not existent or out of date",
                        },
                    ],
                };
            }
            catch (error) {
                // непредвиденная ошибка
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: "UsersCommandRepository -> confirmPasswordRecoveryCode",
                    errorsMessages: [
                        {
                            field: "",
                            message: "Unknown error",
                        },
                    ],
                };
            }
        });
    }
    findByLoginOrEmail(loginOrEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield mongo_db_1.usersCollection.findOne({
                    //"emailConfirmation.isConfirmed": false,
                    $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
                }, 
                // т.к. нам не нужны все данные по юзеру, то оптимизируем - запрашиваем только _id
                { projection: { _id: 1 } });
                return !!user;
            }
            catch (error) {
                // не оптимально, но пока не унифицирован подход к обработке ошибок - оставляем
                console.error("Internal DB error in UsersCommandRepository -> findByLoginOrEmail:", error);
                return false;
            }
        });
    }
    registerNewUser(sentNewUser) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield mongo_db_1.usersCollection.insertOne(sentNewUser);
                // newUserEntry.emailConfirmation.isConfirmed = true; // для созданных админом пользователей подтверждения не нужно
                if (!result.acknowledged) {
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.InternalServerError,
                        statusDescription: "",
                        errorsMessages: [
                            {
                                field: "UsersCommandRepository -> registerNewUser -> usersCollection.insertOne(newUserEntry)",
                                message: "Attempt to insert new user entry failed",
                            },
                        ],
                    };
                }
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.Ok,
                    statusDescription: "UsersCommandRepository -> registerNewUser -> usersCollection.insertOne(newUserEntry)",
                    errorsMessages: [
                        {
                            field: "",
                            message: "Unknown error",
                        },
                    ],
                };
            }
            catch (error) {
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: "UsersCommandRepository -> registerNewUser -> usersCollection.insertOne(newUserEntry)",
                    errorsMessages: [
                        {
                            field: "",
                            message: `Unknown error: ${error}`,
                        },
                    ],
                };
            }
        });
    }
    findNotConfirmedByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield mongo_db_1.usersCollection.findOne({
                    "emailConfirmation.isConfirmed": false,
                    email: email,
                }, { projection: { _id: 1 } });
                return user ? user._id : null;
            }
            catch (error) {
                // не оптимально, но пока не унифицирован подход к обработке ошибок - оставляем
                console.error("Internal DB error in dataCommandRepository -> findNotConfirmedByEmail:", error);
                return null;
            }
        });
    }
    resendConfirmRegistrationCode(sentEmailData, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // console.log(
                //     "<--------------",
                //     userId.toString()
                // );
                const userEntry = yield mongo_db_1.usersCollection.findOne({ _id: userId }); // очень важно!! обязательнь указывать поле по которому идет поиск! '_id:', без него может не найти, хотя ошибку синтаксически не покажет
                if (!userEntry) {
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.InternalServerError,
                        statusDescription: "",
                        errorsMessages: [
                            {
                                field: "resendConfirmRegistrationCode -> usersCollection.findOne({ userId })",
                                message: "User not found",
                            },
                        ],
                    };
                }
                const newConfirmationCode = (0, node_crypto_1.randomUUID)();
                // userEntry.emailConfirmation.confirmationCode = newConfirmationCode;
                // userEntry.emailConfirmation.expirationDate = new Date(new Date().setMinutes(new Date().getMinutes() + 30));
                // const result = await usersCollection.insertOne(newUserEntry);
                // newUserEntry.emailConfirmation.isConfirmed = true; // для созданных админом пользователей подтверждения не нужно
                const result = yield mongo_db_1.usersCollection.updateOne({ _id: userId }, {
                    $set: {
                        "emailConfirmation.confirmationCode": newConfirmationCode,
                        "emailConfirmation.expirationDate": new Date(new Date().setDate(new Date().getMinutes() + 30)),
                    },
                });
                if (!result.acknowledged) {
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.InternalServerError,
                        statusDescription: "",
                        errorsMessages: [
                            {
                                field: "dataCommandRepository -> resendConfirmRegistrationCode -> usersCollection.updateOne",
                                message: "attempt to update user entry failed",
                            },
                        ],
                    };
                }
                // здесь отсылка письма. с точки зрения обработки потенциальных ошибок
                // максимум того что целесообразно сделать, это в том случае если по какой-то причине с нашей стороны чтото сломалось
                // никак не говорить об этом юзерам, пускай они самостоятельно повторно отправляют запрос, мы максимум логируем ошибку
                // тут жестко будет связано с политикой компании по этому поводу
                // так делается чтобы не брать на себя лишней работы, т.к. в случае реальной проблемы с сервисом отправки мы так или иначе будем это чинить
                // а если письмо просто потерялось или юзер тупит - для нас это может быть куча лишней работы по обслуживанию непонятно чего
                // так что во втором случае пусть юзер сам лучше на себя возьмет это работу - просто повторно отправит если что запррос, нам главно оптимально подобрать период удалления неподтвержденных данных (минут 15-30)
                const resendingResult = yield mailer_service_1.mailerService.sendEmailWithCode('"Alex St" <geniusb198@yandex.ru>', sentEmailData.email, newConfirmationCode, mailer_service_1.emailExamples.registrationEmail);
                let status = "Resending went without problems, awaiting confirmation form user";
                if (!resendingResult) {
                    console.error("Something went while resending the registration email");
                    status =
                        "Something went wrong while resending the registration email";
                }
                // отправка результата - все ОК
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.NoContent,
                    statusDescription: status,
                    errorsMessages: [
                        {
                            field: "",
                            message: "",
                        },
                    ],
                };
            }
            catch (error) {
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: "dataCommandRepository -> resendConfirmRegistrationCode",
                    errorsMessages: [
                        {
                            field: "",
                            message: "Unknown error",
                        },
                    ],
                };
            }
        });
    }
};
exports.UsersCommandRepository = UsersCommandRepository;
exports.UsersCommandRepository = UsersCommandRepository = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(composition_root_1.TYPES.BcryptService)),
    __metadata("design:paramtypes", [bcrypt_service_1.BcryptService])
], UsersCommandRepository);
