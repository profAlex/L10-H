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
exports.isUniqueLogin = isUniqueLogin;
exports.isUniqueEmail = isUniqueEmail;
const mongo_db_1 = require("../../db/mongo.db");
function isUniqueLogin(sentLogin) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!sentLogin.trim()) {
            console.error('Irregular error: login appear to be empty inside isUniqueLogin function, but passed middleware checks');
            throw new Error('Irregular error: login appear to be empty inside isUniqueLogin function, but passed middleware checks');
        }
        const filter = {
            $or: [
                { login: sentLogin },
            ]
        };
        return !(yield mongo_db_1.usersCollection.countDocuments(filter));
    });
}
function isUniqueEmail(sentEmail) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!sentEmail.trim()) {
            console.error('Irregular error: email appear to be empty inside isUniqueEmail function, but passed middleware checks');
            throw new Error('Irregular error: email appear to be empty inside isUniqueEmail function, but passed middleware checks');
        }
        const filter = {
            $or: [
                { email: sentEmail },
            ]
        };
        return !(yield mongo_db_1.usersCollection.countDocuments(filter));
    });
}
