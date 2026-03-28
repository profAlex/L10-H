import nodemailer from "nodemailer";
import { envConfig } from "../../config";


export const emailExamples = {
    registrationEmail(code: string) {
        return ` <h1>Thank for your registration</h1>
               <p>To finish registration please follow the link below:<br>
                  <a href='https://somesite.com/confirm-email?code=${code}'>complete registration</a>
              </p>`;
    },
    passwordRecoveryEmail(code: string) {
        return `<h1>Password recovery</h1>
        <p>To finish password recovery please follow the link below:
            <a href='https://somesite.com/password-recovery?recoveryCode=${code}'>recovery password</a>
        </p>`;
    }
};

export const mailerService = {
    async sendConfirmationRegisterEmail(
        from: string,
        to: string,
        registrationCode: string,
        template: (registrationCode: string) => string
    ): Promise<boolean> {

        const transporter = nodemailer.createTransport({
            host: envConfig.mailHost,
            port: envConfig.mailPort,
            secure: true, // использовать SSL
            auth: {
                user: envConfig.mailLogin,
                pass: envConfig.mailPass,
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
            const info = await transporter.sendMail(mailOptions);
            // console.log("Письмо отправлено:", info.messageId);

            return !!info;
        } catch (error) {
            console.error(
                "Ошибка отправки письма:",
                error
            );

            return false;
        }

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