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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailerService = exports.emailExamples = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../../config");
exports.emailExamples = {
    registrationEmail(code) {
        return ` <h1>Thank for your registration</h1>
               <p>To finish registration please follow the link below:<br>
                  <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
              </p>`;
    },
    passwordRecoveryEmail(code) {
        return `<h1>Password recovery</h1>
        <p>To finish password recovery please follow the link below:
            <a href='https://somesite.com/password-recovery?recoveryCode=${code}'>recovery password</a>
        </p>`;
    }
};
exports.mailerService = {
    sendConfirmationRegisterEmail(from, to, registrationCode, template) {
        return __awaiter(this, void 0, void 0, function* () {
            const transporter = nodemailer_1.default.createTransport({
                host: config_1.envConfig.mailHost,
                port: config_1.envConfig.mailPort,
                secure: true, // использовать SSL
                auth: {
                    user: config_1.envConfig.mailLogin,
                    pass: config_1.envConfig.mailPass,
                }
            });
            const mailOptions = {
                from: from || "\"Alex St\" <geniusb198@yandex.ru>",
                to: to,
                subject: "Registration confirmation",
                text: "Please, follow the provided link to finish Your registration.",
                html: template(registrationCode)
            };
            try {
                const info = yield transporter.sendMail(mailOptions);
                // console.log("Письмо отправлено:", info.messageId);
                return !!info;
            }
            catch (error) {
                console.error("Ошибка отправки письма:", error);
                return false;
            }
        });
    }
    // async sendEmail(
    //     email: string,
    //     code: string,
    //     template: (code: string) => string
    // ): Promise<boolean> {
    //     let transporter = nodemailer.createTransport({
    //         service: "gmail",
    //         auth: {
    //             user: appConfig.EMAIL,
    //             pass: appConfig.EMAIL_PASS
    //         }
    //     });
    //
    //     let info = await transporter.sendMail({
    //         from: "\"Kek 👻\" <codeSender>",
    //         to: email,
    //         subject: "Your code is here",
    //         html: template(code) // html body
    //     });
    //
    //     return !!info;
    // }
};
