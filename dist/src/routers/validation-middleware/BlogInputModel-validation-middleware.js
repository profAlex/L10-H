"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogInputModelValidation = void 0;
const express_validator_1 = require("express-validator");
const nameValidation = (0, express_validator_1.body)('name')
    .exists().withMessage('Field name must be specified')
    .isString().withMessage('Incorrect name type (must be string)')
    .trim()
    .isLength({ min: 1, max: 15 }).withMessage('Field\'s name length must be between 1 and 15 symbols');
const descriptionValidation = (0, express_validator_1.body)('description')
    .exists().withMessage('Field description must be specified')
    .isString().withMessage('Incorrect description type (must be string)')
    .trim()
    .isLength({ min: 1, max: 500 }).withMessage('Field\'s description length must be between 1 and 500 symbols');
const websiteUrlValidation = (0, express_validator_1.body)('websiteUrl')
    .exists().withMessage('Field websiteUrl must be specified')
    .isString().withMessage('Incorrect websiteUrl type (must be string)')
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Field\'s websiteUrl length must be between 1 and 100 symbols')
    .matches('^https://([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$').withMessage('Field websiteUrl contains inappropriate web site');
exports.blogInputModelValidation = [
    nameValidation,
    descriptionValidation,
    websiteUrlValidation,
];
// const keyParamsAmountValidation = body().custom((bodyData)=>{
//         return Object.keys(bodyData).length === 3;
//     }).withMessage("Amount of parameters of input entry is not sufficient or exceeds the required amount")
//
// const phoneNumberValidation = body("phoneNumber")
//     .exists().withMessage("Phone number must be specified")
//     .isString().withMessage("Incorrect phone number type (must be string")
//     .trim()
//     .isLength({min: 8, max: 15}).withMessage("Phone length must be between 8 and 15 symbols")
//
// const emailValidation = body("email")
//     .exists().withMessage("Email must be specified")
//     .isString().withMessage("Incorrect email type (must be string")
//     .trim()
//     .isLength({min: 5, max: 100}).withMessage("Email length must be between 5 and 100 symbols")
//     .isEmail().withMessage("Email has incorrect format")
//
// const vehicleMakeValidation = body('vehicleMake')
//     .exists().withMessage('vehicleMake must be specified')
//     .isString().withMessage('vehicleMake should be string')
//     .trim()
//     .isLength({ min: 3, max: 100 }).withMessage('Length of vehicleMake is not correct');
//
// const vehicleModelValidation = body('vehicleModel')
//     .exists().withMessage('Vehicle Model must be specified')
//     .isString().withMessage('vehicleModel should be string')
//     .trim()
//     .isLength({ min: 2, max: 100 }).withMessage('Length of vehicleModel is not correct');
//
// const currentYear = new Date().getFullYear();
// const vehicleYearValidation = body("vehicleYear")
//     .exists().withMessage('Vehicle year must be specified')
//     .isInt({min:1980, max:currentYear}).withMessage("Vehicle year should be between 1980 and current year");
//
// const vehicleLicensePlateValidation = body('vehicleLicensePlate')
//     .exists().withMessage('Vehicle License Plate should be specified')
//     .isString().withMessage('vehicleLicensePlate type should be string')
//     .trim()
//     .isLength({min:6, max:10}).withMessage("Length of vehicleLicensePlate should be between 6 and 10 symbols")
//
// const vehicleDescriptionValidation = body('vehicleDescription')
//     .optional({nullable: true})
//     .isString().withMessage("vehicleDescription type must be string")
//     .trim()
//     .isLength({ min: 10, max: 200 }).withMessage('Length of vehicleDescription should be between 10 and 200 symbols');
//
// const vehicleFeaturesValidation = body('vehicleFeatures')
//     .isArray()
//     .withMessage('vehicleFeatures should be array')
//     .optional()
//     .custom((vehicleFeatures: Array<VehicleFeature>) => {
//         if (vehicleFeatures.length) {
//             const validFeatures = Object.values(VehicleFeature);
//
//             vehicleFeatures.forEach((feature) => {
//                 if (!validFeatures.includes(feature)) {
//                     throw new Error('vehicleFeatures should contain values of VehicleFeature');
//                 }
//             });
//         }
//         return true;
//     });
//
// export const driverInputDtoValidation = [
//     keyParamsAmountValidation,
//     nameValidation,
//     phoneNumberValidation,
//     emailValidation,
//     vehicleMakeValidation,
//     vehicleModelValidation,
//     vehicleYearValidation,
//     vehicleLicensePlateValidation,
//     vehicleDescriptionValidation,
//     vehicleFeaturesValidation,
// ];
