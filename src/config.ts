// import dotenv from "dotenv";
// dotenv.config();

import "dotenv/config";

// дефолтные значения параметров
const DEFAULT_PORT = "3003";
const DEFAULT_ACCESS_TOKEN_SECRET = "ryuas235GCPHvlt347782uzHBSDuw4hr";
const DEFAULT_REFRESH_TOKEN_SECRET = "ryuas235GCPHvlt347782uzHBSDuw4hr";
const DEFAULT_ACCESS_TOKEN_LIFETIME = "10"; // sec
const DEFAULT_REFRESH_TOKEN_LIFETIME = "20"; // sec

const DEFAULT_COOKIE_DOMAIN = "localhost";
const DEFAULT_COOKIE_SECURE = true;

const DEFAULT_MAIL_PORT = "465";
const DEFAULT_MAIL_HOST = "smtp.yandex.ru";
const DEFAULT_MAIL_LOGIN = "geniusb198";
const DEFAULT_MAIL_PASS = "gbpqxmmaleaqmiwu";


// структура конфигурационных значений
type Config = {
    appPort: number;
    accessTokenSecret: string;
    refreshTokenSecret: string;
    accessTokenLifetime: number;
    refreshTokenLifetime: number;
    mailPort: number;
    mailHost: string;
    mailLogin: string;
    mailPass: string;
};

// парсинг значений
const getConfig = (): Config => {
    let appPort = process.env.PORT;
    let accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    let refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
    let accessTokenLifetime = process.env.ACCESS_TOKEN_LIFETIME;
    let refreshTokenLifetime = process.env.REFRESH_TOKEN_LIFETIME;
    let mailPort = process.env.MAIL_PORT;
    let mailHost = process.env.MAIL_HOST;
    let mailLogin = process.env.MAIL_LOGIN;
    let mailPass = process.env.MAIL_PASS;

    // валидация
    if (!appPort) {
        console.warn(
            `PORT is not defined in .env! Applied default port number ${DEFAULT_PORT}.`,
        );
        appPort = DEFAULT_PORT;
    }

    // if (!accessJwtSecret) throw new Error("JWT_SECRET is required in .env");
    if (!accessTokenSecret) {
        console.warn(
            "ACCESS_TOKEN_SECRET is not defined in .env! Applied default value.",
        );
        accessTokenSecret = DEFAULT_ACCESS_TOKEN_SECRET;
    }

    if (!refreshTokenSecret) {
        console.warn(
            "REFRESH_TOKEN_SECRET is not defined in .env! Applied default value.",
        );
        refreshTokenSecret = DEFAULT_REFRESH_TOKEN_SECRET;
    }

    if (!accessTokenLifetime) {
        console.warn(
            `ACCESS_TOKEN_LIFETIME is not defined in .env! Applied default value (seconds) (: ${DEFAULT_ACCESS_TOKEN_LIFETIME}.`,
        );
        accessTokenLifetime = DEFAULT_ACCESS_TOKEN_LIFETIME;
    }

    if (!refreshTokenLifetime) {
        console.warn(
            `REFRESH_TOKEN_LIFETIME is not defined in .env! Applied default value (seconds): ${DEFAULT_REFRESH_TOKEN_LIFETIME}.`,
        );
        refreshTokenLifetime = DEFAULT_REFRESH_TOKEN_LIFETIME;
    }

    if(!mailPort) {
        console.warn(
            `MAIL_PORT is not defined in .env! Applied default value: ${DEFAULT_MAIL_PORT}.`,
        );
        mailPort = DEFAULT_MAIL_PORT;
    }

    if(!mailHost) {
        console.warn(
            `MAIL_HOST is not defined in .env! Applied default value: ${DEFAULT_MAIL_HOST}.`,
        );
        mailHost = DEFAULT_MAIL_HOST;
    }

    if(!mailLogin) {
        console.warn(
            `MAIL_LOGIN is not defined in .env! Applied default value: ${DEFAULT_MAIL_LOGIN}.`,
        );
        mailLogin = DEFAULT_MAIL_LOGIN;
    }

    if(!mailPass) {
        console.warn(
            `MAIL_PASS is not defined in .env! Applied default value: ${DEFAULT_MAIL_PASS}.`,
        );
        mailPass = DEFAULT_MAIL_PASS;
    }


    return {
        appPort: parseInt(appPort, 10),
        accessTokenSecret: accessTokenSecret,
        refreshTokenSecret: refreshTokenSecret,
        accessTokenLifetime: parseInt(accessTokenLifetime, 10),
        refreshTokenLifetime: parseInt(refreshTokenLifetime, 10),
        mailPort: parseInt(mailPort,10),
        mailHost: mailHost,
        mailLogin: mailLogin,
        mailPass: mailPass,
    };
};

export const envConfig = getConfig();

// "requestData":{"userId":"69c15c87cda5d26bd558e4ef","deviceId":"c2ff28c4-a642-4e92-9f30-9cd1119b3de5","expToPass":"2026-03-23T15:30:53.000Z","iatToPass":"2026-03-23T15:30:33.000Z"},
//
// "metaData":[{"_id":"69c15c93cda5d26bd558e4f3","userId":"69c15c87cda5d26bd558e4ef","deviceId":"731f2028-b67e-469a-8fbf-10cb2ba3b115","issuedAt":"2026-03-23T15:30:27.000Z","deviceName":"Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:105.0) Gecko/20100101 Firefox/103.0","deviceIp":"18.195.23.171","expiresAt":"2026-03-23T15:30:47.000Z"},
//     {"_id":"69c15c93cda5d26bd558e4f5","userId":"69c15c87cda5d26bd558e4ef","deviceId":"2e1081d2-d04b-426d-8fed-25dc9564eee1","issuedAt":"2026-03-23T15:30:27.000Z","deviceName":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36","deviceIp":"18.195.23.171","expiresAt":"2026-03-23T15:30:47.000Z"}
//     ,{"_id":"69c15c94cda5d26bd558e4f7","userId":"69c15c87cda5d26bd558e4ef","deviceId":"f568622f-dac9-4529-8461-ba202ae33a32","issuedAt":"2026-03-23T15:30:28.000Z","deviceName":"Mozilla/5.0 (Macintosh; Intel Mac OS X 12_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6 Safari/605.1.15","deviceIp":"18.195.23.171","expiresAt":"2026-03-23T15:30:48.000Z"},
//     {"_id":"69c15c97cda5d26bd558e4fa","userId":"69c15c96cda5d26bd558e4f8","deviceId":"34bbee38-16d0-47a6-8d27-9d4b6ee84b79","issuedAt":"2026-03-23T15:30:31.000Z","deviceName":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36","deviceIp":"18.195.23.171","expiresAt":"2026-03-23T15:30:51.000Z"}]}