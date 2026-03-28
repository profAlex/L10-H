"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginInputModelValidation = exports.userInputModelValidation = void 0;
const express_validator_1 = require("express-validator");
const loginValidation = (0, express_validator_1.body)("login")
    .exists()
    .withMessage("Field 'login' must be specified")
    .isString()
    .withMessage("Incorrect type of field 'login' - must be string")
    .trim()
    .isLength({ min: 3, max: 10 })
    .withMessage("Field 'login' must have length between 3 and 10 symbols")
    .matches("^[a-zA-Z0-9_-]*$")
    .withMessage("Field 'login' contains inappropriate symbols");
const passwordValidation = (0, express_validator_1.body)("password")
    .exists()
    .withMessage("Field 'password' must be specified")
    .isString()
    .withMessage("Incorrect type of field 'password' - must be string")
    .trim()
    .isLength({ min: 6, max: 20 })
    .withMessage("Field 'password' must  have length between 6 and 20 symbols");
const emailValidation = (0, express_validator_1.body)("email")
    .exists()
    .withMessage("Field 'email' must be specified")
    .isString()
    .withMessage("Incorrect type of field 'email' - must be string")
    .trim()
    .matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")
    .withMessage("Field 'email' contains inappropriate symbols");
const loginAndEmailValidation = (0, express_validator_1.body)("loginOrEmail")
    .exists()
    .withMessage("Field 'loginOrEmail' must be specified")
    .isString()
    .withMessage("Incorrect type of field 'loginOrEmail' - must be string");
// .trim()
// .matches('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
// .withMessage('Field \'loginOrEmail\' contains inappropriate symbols');
exports.userInputModelValidation = [
    loginValidation,
    passwordValidation,
    emailValidation,
];
exports.loginInputModelValidation = [
    loginAndEmailValidation,
    passwordValidation,
];
