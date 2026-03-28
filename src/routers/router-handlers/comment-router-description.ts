import { Response } from "express";
import { IdParamName } from "../util-enums/id-names";
import {
    RequestWithParams,
    RequestWithParamsAndBody
} from "../request-types/request-types";
import { HttpStatus } from "../../common/http-statuses/http-statuses";
import { dataQueryRepository } from "../../repository-layers/query-repository-layer/query-repository";
import { CommentInputModel } from "../router-types/comment-input-model";
import { dataCommandRepository } from "../../repository-layers/command-repository-layer/command-repository";
import { commentsService } from "../../service-layer(BLL)/comments-service";


export const getCommentById = async (
    req: RequestWithParams<{ [IdParamName.CommentId]: string }>,
    res: Response
) => {
    const result = await dataQueryRepository.findSingleComment(
        req.params[IdParamName.CommentId]
    );

    if (!result) {
        return res.sendStatus(HttpStatus.NotFound);
    }

    return res.status(HttpStatus.Ok)
        .send(result);
};

export const updateCommentById = async (
    req: RequestWithParamsAndBody<
        { [IdParamName.CommentId]: string },
        CommentInputModel
    >,
    res: Response
) => {
    // проверка наличия userId в структуре req
    if (!req.user || !req.user.userId) {
        console.error({
            message:
                "Required parameter is missing: 'req.user or req.user.userId' inside updateCommentById handler",
            field: "'if (!req.user || !req.user.userId)' check failed"
        });

        return res.status(HttpStatus.InternalServerError)
            .json({
                message: "Internal server error",
                field: ""
            });
    }
    const result = await commentsService.updateComment(
        req.params[IdParamName.CommentId],
        req.user.userId,
        req.body
    );


    if (result.statusCode !== HttpStatus.NoContent) {
        return res.status(result.statusCode)
            .json(result.errorsMessages);
    }

    return res.sendStatus(result.statusCode);
};

export const deleteCommentById = async (
    req: RequestWithParams<{ [IdParamName.CommentId]: string }>,
    res: Response
) => {
    // проверка наличия userId в структуре req
    if (!req.user || !req.user.userId) {
        console.error({
            message:
                "Required parameter is missing: 'req.user or req.user.userId' inside deleteCommentById handler",
            field: "'if (!req.user || !req.user.userId)' check failed"
        });

        return res.status(HttpStatus.InternalServerError)
            .json({
                message: "Internal server error",
                field: ""
            });
    }

    const result = await dataCommandRepository.deleteCommentById(
        req.params[IdParamName.CommentId],
        req.user.userId
    );

    if (result.statusCode !== HttpStatus.NoContent) {
        return res.status(result.statusCode)
            .json(result.errorsMessages);
    }

    return res.sendStatus(result.statusCode);
};
