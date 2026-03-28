"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrationResentConfirmationValidator = exports.registrationConfirmationValidator = void 0;
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
exports.registrationConfirmationValidator = [
    registrationConfirmationCodeValidator
];
exports.registrationResentConfirmationValidator = [
    registrationResentConfirmationEmailValidator
];
