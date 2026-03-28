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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.createNewUser = exports.getSeveralUsers = void 0;
const express_validator_1 = require("express-validator");
const query_repository_1 = require("../../repository-layers/query-repository-layer/query-repository");
const http_statuses_1 = require("../../common/http-statuses/http-statuses");
const users_service_1 = require("../../service-layer(BLL)/users-service");
const custom_error_class_1 = require("../../repository-layers/utility/custom-error-class");
const id_names_1 = require("../util-enums/id-names");
const getSeveralUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sanitizedQuery = (0, express_validator_1.matchedData)(req, {
        locations: ["query"],
        includeOptionals: true,
    }); //утилита для извечения трансформированных значений после валидатара
    //в req.query остаются сырые квери параметры (строки)
    const usersListOutput = yield query_repository_1.dataQueryRepository.getSeveralUsers(sanitizedQuery);
    res.status(http_statuses_1.HttpStatus.Ok).send(usersListOutput);
    return;
});
exports.getSeveralUsers = getSeveralUsers;
const createNewUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let insertedId;
    try {
        insertedId = yield users_service_1.usersService.createNewUser(req.body);
    }
    catch (error) {
        if (error instanceof custom_error_class_1.CustomError) {
            const errorData = error.metaData.errorMessage;
            if (errorData.field === "isUniqueEmail") {
                console.error(`In field: ${errorData.field} - ${errorData.message}`);
                res.status(http_statuses_1.HttpStatus.BadRequest).json({
                    errorsMessages: [
                        { field: "email", message: "email should be unique" },
                    ],
                });
            }
            else {
                console.error(`In field: ${errorData.field} - ${errorData.message}`);
                res.status(http_statuses_1.HttpStatus.BadRequest).json({
                    errorsMessages: [
                        { field: "login", message: "login should be unique" },
                    ],
                });
            }
        }
        else {
            console.error(`Unknown error: ${JSON.stringify(error)}`);
            res.status(http_statuses_1.HttpStatus.InternalServerError).json(JSON.stringify(error));
        }
    }
    if (insertedId) {
        // а вот здесь уже идем в query repo с айдишником который нам вернул command repo
        // ЭТО НАДО ЧЕРЕЗ СЕРВИС ВЫЗЫВАТЬ А НЕ НАПРЯМУЮ! ЕСЛИ ЕТЬ СЛОЙ СЕРВИС ДЛЯ РОУТА, ТО ЧЕРЕЗ НЕГО ВСЕГДА ХОДИМ
        const result = yield query_repository_1.dataQueryRepository.findSingleUser(insertedId);
        if (result) {
            res.status(http_statuses_1.HttpStatus.Created).json(result);
            return;
        }
    }
    res.status(http_statuses_1.HttpStatus.InternalServerError).send("Unknown error while attempting to create new user or couldn't return created user from Query Database.");
    return;
});
exports.createNewUser = createNewUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield users_service_1.usersService.deleteUser(req.params[id_names_1.IdParamName.UserId]);
    if (result === undefined) {
        res.sendStatus(http_statuses_1.HttpStatus.NotFound);
        return;
    }
    res.sendStatus(http_statuses_1.HttpStatus.NoContent);
    return;
});
exports.deleteUser = deleteUser;
