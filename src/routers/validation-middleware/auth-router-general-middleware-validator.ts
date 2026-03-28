import { body } from "express-validator";


const registrationConfirmationCodeValidator = body("code")
    .exists()
    .withMessage("Field 'code' is required")
    .isString()
    .withMessage("Field 'code' must be of type string");

const registrationResentConfirmationEmailValidator = body('email')
    .exists()
    .withMessage('Field "email" is required')
    .isString()
    .withMessage('Field "email" must be of type string')
    .matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)
    .withMessage('Field "email" must be a valid email address');

export const registrationConfirmationValidator = [
    registrationConfirmationCodeValidator
];

export const registrationResentConfirmationValidator = [
    registrationResentConfirmationEmailValidator
];
