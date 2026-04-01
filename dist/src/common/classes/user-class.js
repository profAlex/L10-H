"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const UUIDgeneration_1 = require("../../adapters/randomUUIDgeneration/UUIDgeneration");
class User {
    constructor(login, email, hash, _id) {
        this._id = _id;
        this.id = _id.toString();
        this.login = login;
        this.email = email;
        this.passwordHash = hash;
        this.createdAt = new Date();
        this.emailConfirmation = {
            confirmationCode: UUIDgeneration_1.UUIDgeneration.generateUUID(), // вынесено в функцию чтобы было удобнее мокать эту функцию для проверки в тестах
            expirationDate: new Date(new Date().setMinutes(new Date().getMinutes() + 30)),
            isConfirmed: false,
        };
        this.passwordRecoveryInformation = {
            passwordRecoveryCode: null,
            expirationDate: null,
            isRecoveryInAction: false,
        };
    }
}
exports.User = User;
