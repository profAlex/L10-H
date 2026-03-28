import { Request, Response } from "express";
import { InputGetUsersQuery } from "../router-types/user-search-input-model";
import { matchedData } from "express-validator";
import { dataQueryRepository } from "../../repository-layers/query-repository-layer/query-repository";
import { HttpStatus } from "../../common/http-statuses/http-statuses";
import { usersService } from "../../service-layer(BLL)/users-service";
import { CustomError } from "../../repository-layers/utility/custom-error-class";
import { IdParamName } from "../util-enums/id-names";

export const getSeveralUsers = async (
    req: Request<{}, {}, {}, any>,
    res: Response,
) => {
    const sanitizedQuery = matchedData<InputGetUsersQuery>(req, {
        locations: ["query"],
        includeOptionals: true,
    }); //утилита для извечения трансформированных значений после валидатара
    //в req.query остаются сырые квери параметры (строки)

    const usersListOutput =
        await dataQueryRepository.getSeveralUsers(sanitizedQuery);

    res.status(HttpStatus.Ok).send(usersListOutput);
    return;
};

export const createNewUser = async (req: Request, res: Response) => {
    let insertedId: string | undefined;

    try {
        insertedId = await usersService.createNewUser(req.body);
    } catch (error) {
        if (error instanceof CustomError) {
            const errorData = error.metaData.errorMessage;
            if (errorData.field === "isUniqueEmail") {
                console.error(
                    `In field: ${errorData.field} - ${errorData.message}`,
                );

                res.status(HttpStatus.BadRequest).json({
                    errorsMessages: [
                        { field: "email", message: "email should be unique" },
                    ],
                });
            } else {
                console.error(
                    `In field: ${errorData.field} - ${errorData.message}`,
                );

                res.status(HttpStatus.BadRequest).json({
                    errorsMessages: [
                        { field: "login", message: "login should be unique" },
                    ],
                });
            }
        } else {
            console.error(`Unknown error: ${JSON.stringify(error)}`);
            res.status(HttpStatus.InternalServerError).json(
                JSON.stringify(error),
            );
        }
    }

    if (insertedId) {
        // а вот здесь уже идем в query repo с айдишником который нам вернул command repo
        // ЭТО НАДО ЧЕРЕЗ СЕРВИС ВЫЗЫВАТЬ А НЕ НАПРЯМУЮ! ЕСЛИ ЕТЬ СЛОЙ СЕРВИС ДЛЯ РОУТА, ТО ЧЕРЕЗ НЕГО ВСЕГДА ХОДИМ
        const result = await dataQueryRepository.findSingleUser(insertedId);

        if (result) {
            res.status(HttpStatus.Created).json(result);
            return;
        }
    }

    res.status(HttpStatus.InternalServerError).send(
        "Unknown error while attempting to create new user or couldn't return created user from Query Database.",
    );
    return;
};

export const deleteUser = async (req: Request, res: Response) => {
    const result = await usersService.deleteUser(
        req.params[IdParamName.UserId],
    );

    if (result === undefined) {
        res.sendStatus(HttpStatus.NotFound);
        return;
    }

    res.sendStatus(HttpStatus.NoContent);
    return;
};
