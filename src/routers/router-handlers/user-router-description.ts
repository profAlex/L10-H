import "reflect-metadata";
import { inject, injectable } from "inversify";

import { Request, Response } from "express";
import { InputGetUsersQuery } from "../router-types/user-search-input-model";
import { matchedData } from "express-validator";
import { dataQueryRepository } from "../../repository-layers/query-repository-layer/query-repository";
import { HttpStatus } from "../../common/http-statuses/http-statuses";
import { CustomError } from "../../repository-layers/utility/custom-error-class";
import { IdParamName } from "../util-enums/id-names";
import { UsersQueryRepository } from "../../repository-layers/query-repository-layer/users-query-repository";
import { UsersCommandRepository } from "../../repository-layers/command-repository-layer/users-command-repository";
import { UsersCommandService } from "../../service-layer(BLL)/users-command-service";
import { UsersQueryService } from "../../service-layer(BLL)/users-query-service";
import { TYPES } from "../../composition-root/ioc-types";

@injectable()
export class UsersHandler {
    constructor(
        @inject(TYPES.UsersCommandService) protected usersCommandService: UsersCommandService,
        @inject(TYPES.UsersQueryService) protected usersQueryService: UsersQueryService,
    ) {}

    // constructor(public usersQueryRepository:UsersQueryRepository, public usersCommandRepository:UsersCommandRepository) {
    // }
    public getSeveralUsers = async (
        req: Request<{}, {}, {}, any>,
        res: Response,
    ) => {
        const sanitizedQuery = matchedData<InputGetUsersQuery>(req, {
            locations: ["query"],
            includeOptionals: true,
        }); //утилита для извечения трансформированных значений после валидатара
        //в req.query остаются сырые квери параметры (строки)

        const usersListOutput =
            await this.usersQueryService.getSeveralUsers(sanitizedQuery);

        res.status(HttpStatus.Ok).send(usersListOutput);
        return;
    };

    public createNewUser = async (req: Request, res: Response) => {
        let insertedId: string | undefined;

        try {
            insertedId = await this.usersCommandService.createNewUser(req.body);
        } catch (error) {
            if (error instanceof CustomError) {
                const errorData = error.metaData.errorMessage;
                if (errorData.field === "isUniqueEmail") {
                    console.error(
                        `In field: ${errorData.field} - ${errorData.message}`,
                    );

                    res.status(HttpStatus.BadRequest).json({
                        errorsMessages: [
                            {
                                field: "email",
                                message: "email should be unique",
                            },
                        ],
                    });
                } else {
                    console.error(
                        `In field: ${errorData.field} - ${errorData.message}`,
                    );

                    res.status(HttpStatus.BadRequest).json({
                        errorsMessages: [
                            {
                                field: "login",
                                message: "login should be unique",
                            },
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
            const result =
                await this.usersQueryService.findSingleUser(insertedId);

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

    public deleteUser = async (req: Request, res: Response) => {
        const userId: string =
            typeof req.params[IdParamName.UserId] === "string"
                ? req.params[IdParamName.UserId]
                : req.params[IdParamName.UserId][0];
        const result = await this.usersCommandService.deleteUser(userId);

        if (result === undefined) {
            res.sendStatus(HttpStatus.NotFound);
            return;
        }

        res.sendStatus(HttpStatus.NoContent);
        return;
    };
}
