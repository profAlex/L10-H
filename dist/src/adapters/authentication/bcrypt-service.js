"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BcryptService = void 0;
require("reflect-metadata");
const inversify_1 = require("inversify");
const bcrypt_1 = __importDefault(require("bcrypt"));
let BcryptService = class BcryptService {
    generateHash(password) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const salt = yield bcrypt_1.default.genSalt(10);
                const hash = yield bcrypt_1.default.hash(password, salt);
                return hash;
            }
            catch (error) {
                console.error("Error while generating hash:", error);
                return null;
            }
        });
    }
    checkPassword(password, hash) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield bcrypt_1.default.compare(password, hash);
                return result;
            }
            catch (error) {
                console.error("Error while checking password:", error);
                return null;
            }
        });
    }
};
exports.BcryptService = BcryptService;
exports.BcryptService = BcryptService = __decorate([
    (0, inversify_1.injectable)()
], BcryptService);
;
