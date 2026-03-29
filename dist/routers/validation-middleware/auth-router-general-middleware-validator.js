"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recoveryCodeValidator = exports.registrationResentConfirmationValidator = exports.registrationConfirmationValidator = void 0;
const express_validator_1 = require("express-validator");
const registrationConfirmationCodeValidator = (0, express_validator_1.body)("code")
    .exists()
    .withMessage("Field 'code' is required")
    .isString()
    .withMessage("Field 'code' must be of type string");
const registrationResentConfirmationEmailValidator = (0, express_validator_1.body)('email')
    .exists()
    .withMessage('Field "email" is required')
    .isString()
    .withMessage('Field "email" must be of type string')
    .matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)
    .withMessage('Field "email" must be a valid email address');
const passwordValidation = (0, express_validator_1.body)("password")
    .exists()
    .withMessage("Field 'password' must be specified")
    .isString()
    .withMessage("Incorrect type of field 'password' - must be string")
    .trim()
    .isLength({ min: 6, max: 20 })
    .withMessage("Field 'password' must  have length between 6 and 20 symbols");
exports.registrationConfirmationValidator = [
    registrationConfirmationCodeValidator
];
exports.registrationResentConfirmationValidator = [
    registrationResentConfirmationEmailValidator
];
exports.recoveryCodeValidator = [
    registrationConfirmationCodeValidator,
    passwordValidation
];
