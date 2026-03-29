import { ObjectId } from "mongodb";
import { UUIDgeneration } from "../../adapters/randomUUIDgeneration/UUIDgeneration";

export class User {
    _id: ObjectId;
    id: string;
    login: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
    emailConfirmation: {
        confirmationCode: string;
        expirationDate: Date;
        isConfirmed: boolean;
    };
    passwordRecoveryInformation:{
        passwordRecoveryCode: string | null;
        expirationDate: Date | null;
        isRecoveryInAction: boolean;
    }

    constructor(login: string, email: string, hash: string, _id: ObjectId) {
        this._id = _id;
        this.id = _id.toString();
        this.login = login;
        this.email = email;
        this.passwordHash = hash;
        this.createdAt = new Date();
        this.emailConfirmation = {
            confirmationCode: UUIDgeneration.generateUUID(), // вынесено в функцию чтобы было удобнее мокать эту функцию для проверки в тестах
            expirationDate: new Date(
                new Date().setMinutes(new Date().getMinutes() + 30),
            ),
            isConfirmed: false,
        };
        this.passwordRecoveryInformation = {
            passwordRecoveryCode: null,
            expirationDate: null,
            isRecoveryInAction: false,
        }
    }
}
