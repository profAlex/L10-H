import { Request, Response } from "express";
import { HttpStatus } from "../../common/http-statuses/http-statuses";
import { postsService } from "../../service-layer(BLL)/posts-service";
import { InputGetPostsQuery } from "../router-types/post-search-input-model";
import { matchedData } from "express-validator";
import { dataQueryRepository } from "../../repository-layers/query-repository-layer/query-repository";
import { UserIdType } from "../router-types/user-id-type";
import {
    RequestWithBodyAndUserId,
    RequestWithParamsAndBodyAndUserId,
    RequestWithParamsAndQuery,
    RequestWithUserId,
} from "../request-types/request-types";
import { CommentInputModel } from "../router-types/comment-input-model";
import { IdParamName } from "../util-enums/id-names";
import { PaginatedCommentViewModel } from "../router-types/comment-paginated-view-model";
import { InputGetCommentsQueryModel } from "../router-types/comment-search-input-query-model";

export const getSeveralCommentsByPostId = async (
    req: RequestWithParamsAndQuery<
        { [IdParamName.PostId]: string },
        any //InputGetCommentsQueryModel
    >,
    res: Response,
) => {
    const sanitizedQuery = matchedData<InputGetCommentsQueryModel>(req, {
        locations: ["query"],
        includeOptionals: true,
    }); //утилита для извечения трансформированных значений после валидатара
    //в req.query остаются сырые квери параметры (строки)

    const postId = req.params[IdParamName.PostId];
    if (!postId) {
        console.error(
            "postId seems to be missing in Request inside getSeveralPostsFromBlog, even though it successfully passed middleware checks",
        );

        return res.status(HttpStatus.InternalServerError).json({
            error: "Internal Server Error",
        }); // какие-то коды надо передавать, чтобы пользователи могли сообщать их техподдержке
    }

    const commentsListOutput: PaginatedCommentViewModel =
        await dataQueryRepository.getSeveralCommentsByPostId(
            postId,
            sanitizedQuery,
        );

    return res.status(HttpStatus.Ok).send(commentsListOutput!);
};

export const getSeveralPosts = async (req: Request, res: Response) => {
    const sanitizedQuery = matchedData<InputGetPostsQuery>(req, {
        locations: ["query"],
        includeOptionals: true,
    }); //утилита для извечения трансформированных значений после валидатара
    //в req.query остаются сырые квери параметры (строки)

    const postsListOutput =
        await dataQueryRepository.getSeveralPosts(sanitizedQuery);

    res.status(HttpStatus.Ok).send(postsListOutput);
};

// немного другой способ создания поста, делает то же что и createNewBlogPost, но другой способ передачи blog ID
export const createNewPost = async (req: Request, res: Response) => {
    const insertedId = await postsService.createNewPost(req.body);

    if (insertedId) {
        // а вот здесь уже идем в dataQueryRepo с айдишником который нам вернул dataCommandRepo -
        // это нарушение CQRS? Надо сделать такой же метод в dataCommandRepo или надо еще выше поднимать
        // insertedId и делать отдельный хэндлер?
        const result = await dataQueryRepository.findSinglePost(insertedId);

        if (result) {
            res.status(HttpStatus.Created).json(result);
            return;
        }
    }

    res.status(HttpStatus.InternalServerError).send(
        "Unknown error while attempting to create new post or couldn't return created post from Query Database.",
    );
    return;
};

export const findSinglePost = async (req: Request, res: Response) => {

    const postId: string = typeof req.params[IdParamName.PostId] === 'string' ? req.params[IdParamName.PostId] : req.params[IdParamName.PostId][0];
    const result = await dataQueryRepository.findSinglePost(
        postId,
    );

    if (result === undefined) {
        res.sendStatus(HttpStatus.NotFound);
    }

    res.status(HttpStatus.Ok).json(result);
};

export const updatePost = async (req: Request, res: Response) => {

    const postId: string = typeof req.params[IdParamName.PostId] === 'string' ? req.params[IdParamName.PostId] : req.params[IdParamName.PostId][0];
    const result = await postsService.updatePost(
        postId,
        req.body,
    );

    if (result === undefined) {
        res.sendStatus(HttpStatus.NotFound);
    }

    res.sendStatus(HttpStatus.NoContent);
};

export const deletePost = async (req: Request, res: Response) => {

    const postId: string = typeof req.params[IdParamName.PostId] === 'string' ? req.params[IdParamName.PostId] : req.params[IdParamName.PostId][0];
    const result = await postsService.deletePost(
        postId,
    );

    if (result === undefined) {
        res.sendStatus(HttpStatus.NotFound);
    }

    res.sendStatus(HttpStatus.NoContent);
};

export const createNewComment = async (
    req: RequestWithParamsAndBodyAndUserId<
        { [IdParamName.PostId]: string },
        CommentInputModel,
        UserIdType
    >,
    res: Response,
) => {
    // проверка параметра URL: postId
    const postId = req.params[IdParamName.PostId];
    // if (!postId) {
    //     console.error({
    //         message:
    //             "Missing required parameter: postId inside createNewComment handler",
    //         field: "'if (!postId)' check failed",
    //     });
    //
    //     return res.status(HttpStatus.InternalServerError).json({errorsMessages: [{
    //         message: "Internal server error",
    //         field: "",
    //     }]});
    // }
    //
    // // проверка, что postId — валидная строка (не пустая)
    // if (typeof postId !== "string" || postId.trim().length === 0) {
    //     console.error({
    //         message:
    //             "Required parameter has incorrect format: 'postId' inside createNewComment handler",
    //         field: "'if (typeof postId !== \"string\" || postId.trim().length === 0)' check failed",
    //     });
    //
    //     return res.status(HttpStatus.InternalServerError).json({errorsMessages: [{
    //         message: "Internal server error",
    //         field: "",
    //     }]});
    // }
    //
    // if (!req.body) {
    //     console.error({
    //         message:
    //             "Required parameter is missing: 'req.body' inside createNewComment handler",
    //         field: "'if (!req.body) ' check failed",
    //     });
    //
    //     return res.status(HttpStatus.InternalServerError).json({errorsMessages: [{
    //         message: "Internal server error",
    //         field: "",
    //     }]});
    // }

    // // проверка тела запроса: content
    const { content } = req.body;
    // if (!content) {
    //     console.error({
    //         message:
    //             "Required parameter is missing: 'content' inside createNewComment handler",
    //         field: "'if (!content) ' check failed",
    //     });
    //
    //     return res.status(HttpStatus.InternalServerError).json({errorsMessages: [{
    //         message: "Internal server error",
    //         field: "",
    //     }]});
    // }
    //
    // // проверка, что content — валидная строка (не пустая)
    // if (typeof content !== "string" || content.trim().length === 0) {
    //     console.error({
    //         message:
    //             "Required parameter has incorrect format: 'content' inside createNewComment handler",
    //         field: "'if (typeof content !== \"string\" || content.trim().length === 0)' check failed",
    //     });
    //
    //     return res.status(HttpStatus.InternalServerError).json({errorsMessages: [{
    //         message: "Internal server error",
    //         field: "",
    //     }]});
    // }

    // проверка наличия userId в структуре req
    if (!req.user || !req.user.userId) {
        console.error({
            message:
                "Required parameter is missing: 'req.user or req.user.userId' inside createNewComment handler",
            field: "'if (!req.user || !req.user.userId)' check failed",
        });

        return res.status(HttpStatus.InternalServerError).json({errorsMessages: [{
            message: "Internal server error",
            field: "",
        }]});
    }

    const userId = req.user.userId;
    if (userId.trim().length === 0) {
        console.error({
            message:
                "Required parameter has incorrect format: 'req.user.userId' inside createNewComment handler",
            field: "'if (typeof userId !== \"string\" || userId.trim().length === 0)' check failed",
        });

        return res.status(HttpStatus.InternalServerError).json({errorsMessages: [{
            message: "Internal server error",
            field: "",
        }]});
    }

    const newCommentResult = await postsService.createNewComment(
        postId,
        content,
        userId,
    );

    if (!newCommentResult.data) {
        console.error(
            "Error description: ",
            newCommentResult?.statusDescription,
            JSON.stringify(newCommentResult.errorsMessages),
        );

        return res.status(newCommentResult.statusCode).json({ errorsMessages: newCommentResult.errorsMessages });
    }

    return res.status(newCommentResult.statusCode).send(newCommentResult.data);
};
