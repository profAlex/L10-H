import { body } from "express-validator";

const loginValidation = body("login")
  .exists()
  .withMessage("Field 'login' must be specified")
  .isString()
  .withMessage("Incorrect type of field 'login' - must be string")
  .trim()
  .isLength({ min: 3, max: 10 })
  .withMessage("Field 'login' must have length between 3 and 10 symbols")
  .matches("^[a-zA-Z0-9_-]*$")
  .withMessage("Field 'login' contains inappropriate symbols");

const passwordValidation = body("password")
  .exists()
  .withMessage("Field 'password' must be specified")
  .isString()
  .withMessage("Incorrect type of field 'password' - must be string")
  .trim()
  .isLength({ min: 6, max: 20 })
  .withMessage("Field 'password' must  have length between 6 and 20 symbols");

const emailValidation = body("email")
  .exists()
  .withMessage("Field 'email' must be specified")
  .isString()
  .withMessage("Incorrect type of field 'email' - must be string")
  .trim()
  .matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")
  .withMessage("Field 'email' contains inappropriate symbols");

const loginAndEmailValidation = body("loginOrEmail")
  .exists()
  .withMessage("Field 'loginOrEmail' must be specified")
  .isString()
  .withMessage("Incorrect type of field 'loginOrEmail' - must be string");
// .trim()
// .matches('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
// .withMessage('Field \'loginOrEmail\' contains inappropriate symbols');

export const userInputModelValidation = [
  loginValidation,
  passwordValidation,
  emailValidation,
];

export const loginInputModelValidation = [
  loginAndEmailValidation,
  passwordValidation,
];
