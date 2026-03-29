import { CustomError } from "../utility/custom-error-class";
import { User } from "../../common/classes/user-class";
import { BcryptService } from "../../adapters/authentication/bcrypt-service";
import { UserInputModel } from "../../routers/router-types/user-input-model";
import { ObjectId } from "mongodb";
import { usersCollection } from "../../db/mongo.db";
import { RegistrationConfirmationInput } from "../../routers/router-types/auth-registration-confirmation-input-model";
import { CustomResult } from "../../common/result-type/result-type";
import { HttpStatus } from "../../common/http-statuses/http-statuses";
import { emailExamples, mailerService } from "../../adapters/email-sender/mailer-service";
import { randomUUID } from "node:crypto";
import { PasswordRecoveryInputModel } from "../../routers/router-types/auth-password-recovery-input-model";
import { NewPasswordRecoveryInputModel } from "../../routers/router-types/auth-new-password-recovery-input-model";
import {
    ResentRegistrationConfirmationInput
} from "../../routers/router-types/auth-resent-registration-confirmation-input-model";

export class UsersCommandRepository {

    constructor(protected bcryptService:BcryptService) {}

    async createNewUser(
        sentNewUser: UserInputModel,
    ): Promise<string | undefined> {
        try {
            const passwordHash = await this.bcryptService.generateHash(
                sentNewUser.password,
            );
            if (!passwordHash) {
                throw new CustomError({
                    errorMessage: {
                        field: "bcryptService.generateHash",
                        message: "Generating hash error",
                    },
                });
            }

            const tempId = new ObjectId();

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
                sentNewUser.login,
                sentNewUser.email,
                passwordHash,
                tempId,
            );

            newUserEntry.emailConfirmation.isConfirmed = true; // для созданных админом пользователей подтверждения не нужно

            const result = await usersCollection.insertOne(newUserEntry);

            if (!result.acknowledged) {
                throw new CustomError({
                    errorMessage: {
                        field: "UsersCommandRepository -> createNewUser -> usersCollection.insertOne(newUserEntry)",
                        message: "attempt to insert new user entry failed",
                    },
                });
            }
            return result.insertedId.toString();
        } catch (error) {
            if (error instanceof CustomError) {
                if (error.metaData) {
                    const errorData = error.metaData.errorMessage;
                    console.error(
                        `In field: ${errorData.field} - ${errorData.message}`,
                    );
                } else {
                    console.error(`Unknown error: ${JSON.stringify(error)}`);
                }

                return undefined;
            } else {
                console.error(`Unknown error: ${JSON.stringify(error)}`);
                throw new Error(
                    "Placeholder for an error to be rethrown and dealt with in the future in createNewUser method of dataCommandRepository",
                );
            }
        }
    }

    async deleteUser(userId: string): Promise<null | undefined> {
        try {
            if (ObjectId.isValid(userId)) {
                const idToCheck = new ObjectId(userId);
                const res = await usersCollection.deleteOne({ _id: idToCheck });

                if (!res.acknowledged) {
                    throw new CustomError({
                        errorMessage: {
                            field: "usersCollection.deleteOne",
                            message: "attempt to delete user entry failed",
                        },
                    });
                }

                if (res.deletedCount === 1) {
                    return null;
                }
            } else {
                return undefined;
            }
        } catch (error) {
            if (error instanceof CustomError) {
                if (error.metaData) {
                    const errorData = error.metaData.errorMessage;
                    console.error(
                        `In field: ${errorData.field} - ${errorData.message}`,
                    );
                } else {
                    console.error(`Unknown error: ${JSON.stringify(error)}`);
                }

                return undefined;
            } else {
                console.error(
                    `Unknown error inside UsersCommandRepository -> deleteUser: ${JSON.stringify(error)}`,
                );
                throw new Error(
                    "Placeholder for an error to be rethrown and dealt with in the future in deleteUser method of dataCommandRepository",
                );
            }
        }
    }

    async confirmRegistrationCode(
        sentConfirmationData: RegistrationConfirmationInput,
    ): Promise<CustomResult> {
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

            const searchResult = await usersCollection.findOne(
                {
                    "emailConfirmation.confirmationCode":
                    sentConfirmationData.code,
                    "emailConfirmation.expirationDate": { $gt: new Date() },
                    "emailConfirmation.isConfirmed": false,
                },
                { projection: { _id: 1 } },
            );

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
                const updateResult = await usersCollection.updateOne(
                    { _id: searchResult._id },
                    {
                        $set: {
                            "emailConfirmation.confirmationCode": null,
                            "emailConfirmation.isConfirmed": true,
                        },
                    },
                );

                if (updateResult.acknowledged) {
                    return {
                        data: null,
                        statusCode: HttpStatus.NoContent,
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
                    statusCode: HttpStatus.InternalServerError,
                    statusDescription:
                        "Couldn't confirm user: UsersCommandRepository -> confirmRegistrationCode",
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
                statusCode: HttpStatus.BadRequest,
                statusDescription:
                    "Couldn't confirm user: UsersCommandRepository -> confirmRegistrationCode",
                errorsMessages: [
                    {
                        field: "code",
                        message:
                            "Couldn't confirm user - not existent or out of date",
                    },
                ],
            };
        } catch (error) {
            // непредвиденная ошибка
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription:
                    "UsersCommandRepository -> confirmRegistrationCode",
                errorsMessages: [
                    {
                        field: "",
                        message: "Unknown error",
                    },
                ],
            };
        }
    }

    async findConfirmedByEmail(email: string): Promise<ObjectId | null> {
        try {
            const user = await usersCollection.findOne<{ _id: ObjectId }>(
                {
                    "emailConfirmation.isConfirmed": true,
                    email: email,
                },
                { projection: { _id: 1 } }, // т.к. нам не нужны все данные по юзеру, то оптимизируем - запрашиваем только _id
            );

            return user ? user._id : null;
        } catch (error) {
            // не оптимально, но пока не унифицирован подход к обработке ошибок - оставляем
            console.error(
                "Internal DB error in UsersCommandRepository -> findConfirmedByEmail:",
                error,
            );

            return null;
        }
    }

    async sendPasswordRecoveryInfo(
        sentEmailData: PasswordRecoveryInputModel,
        userId: ObjectId,
    ): Promise<CustomResult> {
        try {
            // console.log(
            //     "<--------------",
            //     userId.toString()
            // );

            const userEntry = await usersCollection.findOne({ _id: userId }); // очень важно!! обязательнь указывать поле по которому идет поиск! '_id:', без него может не найти, хотя ошибку синтаксически не покажет

            if (!userEntry) {
                return {
                    data: null,
                    statusCode: HttpStatus.InternalServerError,
                    statusDescription: "",
                    errorsMessages: [
                        {
                            field: "UsersCommandRepository -> sendPasswordRecoveryInfo -> usersCollection.findOne({ userId })",
                            message: "User not found",
                        },
                    ],
                };
            }

            const newRecoveryCode = randomUUID();

            const result = await usersCollection.updateOne(
                { _id: userId },
                {
                    $set: {
                        "passwordRecoveryInformation.passwordRecoveryCode":
                        newRecoveryCode,
                        "passwordRecoveryInformation.expirationDate": new Date(
                            new Date().setDate(new Date().getMinutes() + 3000), // здесь значение 3000 просто специально оч большое, вообще этой функциональности не было заложено в ТЗ, заложил ее на будущее, можно и убрать
                        ),
                        "passwordRecoveryInformation.isRecoveryInAction": true,
                    },
                },
            );

            if (!result.acknowledged) {
                return {
                    data: null,
                    statusCode: HttpStatus.InternalServerError,
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

            const sendingResult =
                await mailerService.sendEmailWithCode(
                    '"Alex St" <geniusb198@yandex.ru>',
                    sentEmailData.email,
                    newRecoveryCode,
                    emailExamples.passwordRecoveryEmail,
                );

            let status =
                "Sending recovery email went without problems, awaiting confirmation form user";
            if (!sendingResult) {
                console.error(
                    "Something went while sending the recovery email",
                );
                status =
                    "Something went wrong while sending the recovery email";
            }

            // отправка результата - все ОК
            return {
                data: null,
                statusCode: HttpStatus.NoContent,
                statusDescription: status,
                errorsMessages: [
                    {
                        field: "",
                        message: "",
                    },
                ],
            };
        } catch (error) {
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription:
                    "UsersCommandRepository -> sendPasswordRecoveryInfo",
                errorsMessages: [
                    {
                        field: "",
                        message: "Unknown error",
                    },
                ],
            };
        }
    }

    async confirmPasswordRecoveryCode(
        sentConfirmationData: NewPasswordRecoveryInputModel,
    ): Promise<CustomResult> {
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

            const searchResult = await usersCollection.findOne(
                {
                    "passwordRecoveryInformation.passwordRecoveryCode":
                    sentConfirmationData.recoveryCode,
                    "passwordRecoveryInformation.expirationDate": { $gt: new Date() },
                    "passwordRecoveryInformation.isRecoveryInAction": true,
                },
                { projection: { _id: 1 } },
            );

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
                const newPasswordHash = await this.bcryptService.generateHash(
                    sentConfirmationData.newPassword
                );

                if (!newPasswordHash) {
                    return {
                        data: null,
                        statusCode: HttpStatus.InternalServerError,
                        statusDescription: "Error inside UsersCommandRepository -> confirmPasswordRecoveryCode -> bcryptService.generateHash",
                        errorsMessages: [
                            {
                                field: "bcryptService.generateHash",
                                message: "Generating hash error"
                            }
                        ]
                    };
                }

                const updateResult = await usersCollection.updateOne(
                    { _id: searchResult._id },
                    {
                        $set: {
                            passwordHash: newPasswordHash,
                            "passwordRecoveryInformation.confirmationCode": null,
                            "passwordRecoveryInformation.isRecoveryInAction": false,
                        },
                    },
                );

                if (updateResult.acknowledged) {
                    return {
                        data: null,
                        statusCode: HttpStatus.NoContent,
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
                    statusCode: HttpStatus.InternalServerError,
                    statusDescription:
                        "Couldn't confirm new password: UsersCommandRepository -> confirmPasswordRecoveryCode",
                    errorsMessages: [
                        {
                            field: "",
                            message: "Couldn't confirm password",
                        },
                    ],
                };
            }

            // юзер не был найден или просрочен
            return {
                data: null,
                statusCode: HttpStatus.BadRequest,
                statusDescription:
                    "Couldn't confirm new password: UsersCommandRepository -> confirmPasswordRecoveryCode",
                errorsMessages: [
                    {
                        field: "code",
                        message:
                            "Couldn't confirm new password - not existent or out of date",
                    },
                ],
            };
        } catch (error) {
            // непредвиденная ошибка
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription:
                    "UsersCommandRepository -> confirmPasswordRecoveryCode",
                errorsMessages: [
                    {
                        field: "",
                        message: "Unknown error",
                    },
                ],
            };
        }
    }

    async findByLoginOrEmail(loginOrEmail: string): Promise<boolean> {
        try {
            const user = await usersCollection.findOne(
                {
                    //"emailConfirmation.isConfirmed": false,
                    $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
                },
                // т.к. нам не нужны все данные по юзеру, то оптимизируем - запрашиваем только _id
                { projection: { _id: 1 } },
            );

            return !!user;
        } catch (error) {
            // не оптимально, но пока не унифицирован подход к обработке ошибок - оставляем
            console.error(
                "Internal DB error in UsersCommandRepository -> findByLoginOrEmail:",
                error,
            );

            return false;
        }
    }

    async registerNewUser(sentNewUser: User): Promise<CustomResult> {
        try {
            const result = await usersCollection.insertOne(sentNewUser);
            // newUserEntry.emailConfirmation.isConfirmed = true; // для созданных админом пользователей подтверждения не нужно

            if (!result.acknowledged) {
                return {
                    data: null,
                    statusCode: HttpStatus.InternalServerError,
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
                statusCode: HttpStatus.Ok,
                statusDescription:
                    "UsersCommandRepository -> registerNewUser -> usersCollection.insertOne(newUserEntry)",
                errorsMessages: [
                    {
                        field: "",
                        message: "Unknown error",
                    },
                ],
            };
        } catch (error) {
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription:
                    "UsersCommandRepository -> registerNewUser -> usersCollection.insertOne(newUserEntry)",
                errorsMessages: [
                    {
                        field: "",
                        message: `Unknown error: ${error}`,
                    },
                ],
            };
        }
    }

    async findNotConfirmedByEmail(email: string): Promise<ObjectId | null> {
        try {
            const user = await usersCollection.findOne<{ _id: ObjectId }>(
                {
                    "emailConfirmation.isConfirmed": false,
                    email: email,
                },
                { projection: { _id: 1 } }, // т.к. нам не нужны все данные по юзеру, то оптимизируем - запрашиваем только _id
            );

            return user ? user._id : null;
        } catch (error) {
            // не оптимально, но пока не унифицирован подход к обработке ошибок - оставляем
            console.error(
                "Internal DB error in dataCommandRepository -> findNotConfirmedByEmail:",
                error,
            );

            return null;
        }
    }

    async resendConfirmRegistrationCode(
        sentEmailData: ResentRegistrationConfirmationInput,
        userId: ObjectId,
    ): Promise<CustomResult> {
        try {
            // console.log(
            //     "<--------------",
            //     userId.toString()
            // );

            const userEntry = await usersCollection.findOne({ _id: userId }); // очень важно!! обязательнь указывать поле по которому идет поиск! '_id:', без него может не найти, хотя ошибку синтаксически не покажет

            if (!userEntry) {
                return {
                    data: null,
                    statusCode: HttpStatus.InternalServerError,
                    statusDescription: "",
                    errorsMessages: [
                        {
                            field: "resendConfirmRegistrationCode -> usersCollection.findOne({ userId })",
                            message: "User not found",
                        },
                    ],
                };
            }

            const newConfirmationCode = randomUUID();
            // userEntry.emailConfirmation.confirmationCode = newConfirmationCode;
            // userEntry.emailConfirmation.expirationDate = new Date(new Date().setMinutes(new Date().getMinutes() + 30));

            // const result = await usersCollection.insertOne(newUserEntry);
            // newUserEntry.emailConfirmation.isConfirmed = true; // для созданных админом пользователей подтверждения не нужно

            const result = await usersCollection.updateOne(
                { _id: userId },
                {
                    $set: {
                        "emailConfirmation.confirmationCode":
                        newConfirmationCode,
                        "emailConfirmation.expirationDate": new Date(
                            new Date().setDate(new Date().getMinutes() + 30),
                        ),
                    },
                },
            );

            if (!result.acknowledged) {
                return {
                    data: null,
                    statusCode: HttpStatus.InternalServerError,
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

            const resendingResult =
                await mailerService.sendEmailWithCode(
                    '"Alex St" <geniusb198@yandex.ru>',
                    sentEmailData.email,
                    newConfirmationCode,
                    emailExamples.registrationEmail,
                );

            let status =
                "Resending went without problems, awaiting confirmation form user";
            if (!resendingResult) {
                console.error(
                    "Something went while resending the registration email",
                );
                status =
                    "Something went wrong while resending the registration email";
            }

            // отправка результата - все ОК
            return {
                data: null,
                statusCode: HttpStatus.NoContent,
                statusDescription: status,
                errorsMessages: [
                    {
                        field: "",
                        message: "",
                    },
                ],
            };
        } catch (error) {
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription:
                    "dataCommandRepository -> resendConfirmRegistrationCode",
                errorsMessages: [
                    {
                        field: "",
                        message: "Unknown error",
                    },
                ],
            };
        }
    }
}