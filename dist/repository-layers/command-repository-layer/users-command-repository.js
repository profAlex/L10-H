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
exports.UsersCommandRepository = void 0;
const custom_error_class_1 = require("../utility/custom-error-class");
const user_class_1 = require("../../common/classes/user-class");
const mongodb_1 = require("mongodb");
const mongo_db_1 = require("../../db/mongo.db");
class UsersCommandRepository {
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
                            field: "usersCollection.insertOne(newUserEntry)",
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
                    console.error(`Unknown error inside dataCommandRepository.deleteUser: ${JSON.stringify(error)}`);
                    throw new Error("Placeholder for an error to be rethrown and dealt with in the future in deleteUser method of dataCommandRepository");
                }
            }
        });
    }
}
exports.UsersCommandRepository = UsersCommandRepository;
