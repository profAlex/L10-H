import { CustomError } from "../utility/custom-error-class";
import { User } from "../../common/classes/user-class";
import { BcryptService } from "../../adapters/authentication/bcrypt-service";
import { UserInputModel } from "../../routers/router-types/user-input-model";
import { ObjectId } from "mongodb";
import { usersCollection } from "../../db/mongo.db";

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
                        field: "usersCollection.insertOne(newUserEntry)",
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
                    `Unknown error inside dataCommandRepository.deleteUser: ${JSON.stringify(error)}`,
                );
                throw new Error(
                    "Placeholder for an error to be rethrown and dealt with in the future in deleteUser method of dataCommandRepository",
                );
            }
        }
    }

}