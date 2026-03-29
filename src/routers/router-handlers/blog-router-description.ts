import { Request, Response } from "express";
import { HttpStatus } from "../../common/http-statuses/http-statuses";
import { blogsService } from "../../service-layer(BLL)/blogs-service";
import { InputGetBlogsQuery } from "../router-types/blog-search-input-model";
import { matchedData } from "express-validator";
import { InputGetBlogPostsByIdQuery } from "../router-types/blog-search-by-id-input-model";
import { dataQueryRepository } from "../../repository-layers/query-repository-layer/query-repository";
import { IdParamName } from "../util-enums/id-names";

export const getSeveralBlogs = async (req: Request, res: Response) => {
    const sanitizedQuery = matchedData<InputGetBlogsQuery>(req, {
        locations: ["query"],
        includeOptionals: true,
    }); //утилита для извечения трансформированных значений после валидатара
    //в req.query остаются сырые квери параметры (строки)

    const driversListOutput =
        await dataQueryRepository.getSeveralBlogs(sanitizedQuery);

    res.status(HttpStatus.Ok).send(driversListOutput);
    return;
};

export const createNewBlog = async (req: Request, res: Response) => {
    const insertedId = await blogsService.createNewBlog(req.body);

    if (insertedId) {
        // а вот здесь уже идем в query repo с айдишником который нам вернул command repo
        const result = await dataQueryRepository.findSingleBlog(insertedId);

        if (result) {
            res.status(HttpStatus.Created).json(result);
            return;
        }
    }

    res.status(HttpStatus.InternalServerError).send(
        "Unknown error while attempting to create new blog or couldn't return created blog from Query Database.",
    );
    return;
};

export const getSeveralPostsFromBlog = async (req: Request, res: Response) => {
    const sanitizedQuery = matchedData<InputGetBlogPostsByIdQuery>(req, {
        locations: ["query"],
        includeOptionals: true,
    }); //утилита для извечения трансформированных значений после валидатара
    //в req.query остаются сырые квери параметры (строки)

    // const blogId: string = req.params[IdParamName.BlogId];
    const blogId: string = typeof req.params[IdParamName.BlogId] === 'string' ? req.params[IdParamName.BlogId] : req.params[IdParamName.BlogId][0];
    if (!blogId) {
        console.error(
            "blogId seems to be missing in Request inside getSeveralPostsFromBlog, even though it successfully passed middleware checks",
        );

        return res.status(HttpStatus.InternalServerError).json({
            error: "Internal Server Error",
        }); // какие-то коды надо передавать, чтобы пользователи могли сообщать их техподдержке
    }

    const postListOutput = await dataQueryRepository.getSeveralPostsById(
        blogId,
        sanitizedQuery,
    );

    res.status(HttpStatus.Ok).send(postListOutput);
    return;
};

export const createNewBlogPost = async (req: Request, res: Response) => {
    // const insertedId = await blogsService.createNewBlog(req.body);

    const blogId: string = typeof req.params[IdParamName.BlogId] === 'string' ? req.params[IdParamName.BlogId] : req.params[IdParamName.BlogId][0];
    const insertedId = await blogsService.createNewBlogPost(
        blogId,
        req.body,
    );

    if (insertedId) {
        // а вот здесь уже идем в query repo с айдишником который нам вернул command repo
        // это нарушение CQRS? Надо сделать такой же метод в dataCommandRepo или надо еще выше поднимать
        // insertedId и делать отдельный хэндлер?
        const result = await dataQueryRepository.findSinglePost(insertedId);

        if (result) {
            res.status(HttpStatus.Created).json(result);
            return;
        }
    }

    res.status(HttpStatus.InternalServerError).send(
        "Unknown error while attempting to create new blog-post or couldn't return created blog-post from Query Database.",
    );
    return;
};

export const findSingleBlog = async (req: Request, res: Response) => {
    // console.warn("<-------LOOK ID_3: ", req.params[IdParamName.BlogId]);

    const blogId: string = typeof req.params[IdParamName.BlogId] === 'string' ? req.params[IdParamName.BlogId] : req.params[IdParamName.BlogId][0];
    const result = await dataQueryRepository.findSingleBlog(
        blogId,
    );

    // console.warn("<-------ID WAS FOUND??", result);

    if (result === undefined) {
        res.sendStatus(HttpStatus.NotFound);
        return;
    }

    res.status(HttpStatus.Ok).json(result);
    return;
};

export const updateBlog = async (req: Request, res: Response) => {

    const blogId: string = typeof req.params[IdParamName.BlogId] === 'string' ? req.params[IdParamName.BlogId] : req.params[IdParamName.BlogId][0];
    const result = await blogsService.updateBlog(
        blogId,
        req.body,
    );

    if (result === undefined) {
        res.sendStatus(HttpStatus.NotFound);
        return;
    }

    res.sendStatus(HttpStatus.NoContent);
    return;
};

export const deleteBlog = async (req: Request, res: Response) => {

    const blogId: string = typeof req.params[IdParamName.BlogId] === 'string' ? req.params[IdParamName.BlogId] : req.params[IdParamName.BlogId][0];
    const result = await blogsService.deleteBlog(
        blogId,
    );

    if (result === undefined) {
        res.sendStatus(HttpStatus.NotFound);
        return;
    }

    res.sendStatus(HttpStatus.NoContent);
    return;
};
