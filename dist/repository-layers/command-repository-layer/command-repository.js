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
exports.dataCommandRepository = void 0;
exports.findCommentByPrimaryKey = findCommentByPrimaryKey;
exports.findSessionByPrimaryKey = findSessionByPrimaryKey;
const mongo_db_1 = require("../../db/mongo.db");
const mongodb_1 = require("mongodb");
const custom_error_class_1 = require("../utility/custom-error-class");
const http_statuses_1 = require("../../common/http-statuses/http-statuses");
const mailer_service_1 = require("../../adapters/email-sender/mailer-service");
const node_crypto_1 = require("node:crypto");
function findBlogByPrimaryKey(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return mongo_db_1.bloggersCollection.findOne({ _id: id });
    });
}
function findPostByPrimaryKey(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return mongo_db_1.postsCollection.findOne({ _id: id });
    });
}
function findUserByPrimaryKey(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return mongo_db_1.usersCollection.findOne({ _id: id });
    });
}
function findCommentByPrimaryKey(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return mongo_db_1.commentsCollection.findOne({ _id: id });
    });
}
function findSessionByPrimaryKey(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return mongo_db_1.sessionsDataStorage.findOne({ _id: id });
    });
}
exports.dataCommandRepository = {
    // *****************************
    // методы для управления блогами
    // *****************************
    createNewBlog(newBlog) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tempId = new mongodb_1.ObjectId();
                const newBlogEntry = Object.assign(Object.assign({ _id: tempId, id: tempId.toString() }, newBlog), { createdAt: new Date(), isMembership: false });
                const result = yield mongo_db_1.bloggersCollection.insertOne(newBlogEntry);
                if (!result.acknowledged) {
                    throw new custom_error_class_1.CustomError({
                        errorMessage: {
                            field: "bloggersCollection.insertOne(newBlogEntry)",
                            message: "attempt to insert new blog entry failed",
                        },
                    });
                }
                return result.insertedId.toString();
            }
            catch (error) {
                if (error instanceof custom_error_class_1.CustomError) {
                    if (error.metaData) {
                        const errorData = error.metaData.errorMessage;
                        console.error(`In field: ${errorData.field} - ${errorData.message}`);
                    }
                    else {
                        console.error(`Unknown error: ${JSON.stringify(error)}`);
                    }
                    // throw new Error('Placeholder for an error in to be rethrown and dealt with in the future in createNewBlog method of dataCommandRepository');
                    return undefined;
                }
                else {
                    console.error(`Unknown error: ${JSON.stringify(error)}`);
                    throw new Error("Placeholder for an error to be rethrown and dealt with in the future in createNewBlog method of dataCommandRepository");
                }
            }
        });
    },
    updateBlog(blogId, newData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (mongodb_1.ObjectId.isValid(blogId)) {
                    const idToCheck = new mongodb_1.ObjectId(blogId);
                    const res = yield mongo_db_1.bloggersCollection.updateOne({ _id: idToCheck }, { $set: Object.assign({}, newData) });
                    if (!res.acknowledged) {
                        throw new custom_error_class_1.CustomError({
                            errorMessage: {
                                field: "bloggersCollection.updateOne",
                                message: "attempt to update blog entry failed",
                            },
                        });
                    }
                    if (res.matchedCount === 1) {
                        // успешное выполнение
                        return null;
                    }
                }
                else {
                    throw new custom_error_class_1.CustomError({
                        errorMessage: {
                            field: "ObjectId.isValid(blogId)",
                            message: "invalid blog ID",
                        },
                    });
                }
            }
            catch (error) {
                if (error instanceof custom_error_class_1.CustomError) {
                    if (error.metaData) {
                        const errorData = error.metaData.errorMessage;
                        console.error(`In field: ${errorData.field} - ${errorData.message}`);
                    }
                    else {
                        console.error(`Unknown error: ${JSON.stringify(error)}`);
                    }
                    return undefined;
                }
                else {
                    console.error(`Unknown error inside dataCommandRepository.updateBlog: ${JSON.stringify(error)}`);
                    throw new Error("Placeholder for an error to be rethrown and dealt with in the future in updateBlog method of dataCommandRepository");
                }
            }
        });
    },
    deleteBlog(blogId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (mongodb_1.ObjectId.isValid(blogId)) {
                    const idToCheck = new mongodb_1.ObjectId(blogId);
                    const res = yield mongo_db_1.bloggersCollection.deleteOne({
                        _id: idToCheck,
                    });
                    if (!res.acknowledged) {
                        throw new custom_error_class_1.CustomError({
                            errorMessage: {
                                field: "bloggersCollection.deleteOne",
                                message: "attempt to delete blog entry failed",
                            },
                        });
                    }
                    if (res.deletedCount === 1) {
                        return null;
                    }
                }
                else {
                    return undefined;
                }
            }
            catch (error) {
                if (error instanceof custom_error_class_1.CustomError) {
                    if (error.metaData) {
                        const errorData = error.metaData.errorMessage;
                        console.error(`In field: ${errorData.field} - ${errorData.message}`);
                    }
                    else {
                        console.error(`Unknown error: ${JSON.stringify(error)}`);
                    }
                    // throw new Error('Placeholder for an error in to be rethrown and dealt with in the future in createNewBlog method of dataCommandRepository');
                    return undefined;
                }
                else {
                    console.error(`Unknown error inside dataCommandRepository.deleteBlog: ${JSON.stringify(error)}`);
                    throw new Error("Placeholder for an error to be rethrown and dealt with in the future in deleteBlog method of dataCommandRepository");
                }
            }
        });
    },
    // *****************************
    // методы для управления постами
    // *****************************
    getAllPosts() {
        return __awaiter(this, void 0, void 0, function* () {
            const tempContainer = yield mongo_db_1.postsCollection.find({}).toArray();
            return tempContainer.map((value) => ({
                id: value._id.toString(),
                title: value.title,
                shortDescription: value.shortDescription,
                content: value.content,
                blogId: value.blogId,
                blogName: value.blogName,
                createdAt: value.createdAt,
            }));
            // _id: ObjectId,
            // id: string;
            // title: string;
            // shortDescription: string;
            // content: string;
            // blogId: string;
            // blogName: string;
            // createdAt: Date;
        });
    },
    createNewPost(newPost) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (mongodb_1.ObjectId.isValid(newPost.blogId)) {
                    const relatedBlogger = yield findBlogByPrimaryKey(new mongodb_1.ObjectId(newPost.blogId));
                    const tempId = new mongodb_1.ObjectId();
                    if (relatedBlogger) {
                        const newPostEntry = Object.assign(Object.assign({ _id: tempId, id: tempId.toString() }, newPost), { blogName: relatedBlogger.name, createdAt: new Date() });
                        const result = yield mongo_db_1.postsCollection.insertOne(newPostEntry);
                        if (!result.acknowledged) {
                            throw new custom_error_class_1.CustomError({
                                errorMessage: {
                                    field: "postsCollection.insertOne(newPostEntry)",
                                    message: "attempt to insert new post entry failed",
                                },
                            });
                        }
                        return result.insertedId.toString();
                    }
                    else {
                        throw new custom_error_class_1.CustomError({
                            errorMessage: {
                                field: "findBlogByPrimaryKey(new ObjectId(newPost.blogId))",
                                message: "attempt to find blogger failed",
                            },
                        });
                    }
                }
                else {
                    throw new custom_error_class_1.CustomError({
                        errorMessage: {
                            field: "ObjectId.isValid(newPost.blogId)",
                            message: "invalid blogId",
                        },
                    });
                }
            }
            catch (error) {
                if (error instanceof custom_error_class_1.CustomError) {
                    if (error.metaData) {
                        const errorData = error.metaData.errorMessage;
                        console.error(`In field: ${errorData.field} - ${errorData.message}`);
                    }
                    else {
                        console.error(`Unknown error: ${JSON.stringify(error)}`);
                    }
                    // throw new Error('Placeholder for an error in to be rethrown and dealt with in the future in createNewBlog method of dataCommandRepository');
                    return undefined;
                }
                else {
                    console.error(`Unknown error inside dataCommandRepository.createNewPost: ${JSON.stringify(error)}`);
                    throw new Error("Placeholder for an error to be rethrown and dealt with in the future in createNewPost method of dataCommandRepository");
                }
            }
        });
    },
    createNewBlogPost(sentBlogId, newPost) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (mongodb_1.ObjectId.isValid(sentBlogId)) {
                    const relatedBlogger = yield findBlogByPrimaryKey(new mongodb_1.ObjectId(sentBlogId));
                    const tempId = new mongodb_1.ObjectId();
                    if (relatedBlogger) {
                        const newPostEntry = Object.assign(Object.assign({ _id: tempId, id: tempId.toString() }, newPost), { blogId: sentBlogId, blogName: relatedBlogger.name, createdAt: new Date() });
                        const result = yield mongo_db_1.postsCollection.insertOne(newPostEntry);
                        if (!result.acknowledged) {
                            throw new custom_error_class_1.CustomError({
                                errorMessage: {
                                    field: "postsCollection.insertOne(newPostEntry)",
                                    message: "attempt to insert new post entry failed",
                                },
                            });
                        }
                        return result.insertedId.toString();
                    }
                }
            }
            catch (error) {
                if (error instanceof custom_error_class_1.CustomError) {
                    if (error.metaData) {
                        const errorData = error.metaData.errorMessage;
                        console.error(`In field: ${errorData.field} - ${errorData.message}`);
                    }
                    else {
                        console.error(`Unknown error: ${JSON.stringify(error)}`);
                    }
                    // throw new Error('Placeholder for an error in to be rethrown and dealt with in the future in createNewBlog method of dataCommandRepository');
                    return undefined;
                }
                else {
                    console.error(`Unknown error: ${JSON.stringify(error)}`);
                    throw new Error("Placeholder for an error to be rethrown and dealt with in the future in createNewBlogPost method of dataCommandRepository");
                }
            }
        });
    },
    updatePost(postId, newData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (mongodb_1.ObjectId.isValid(postId)) {
                    const idToCheck = new mongodb_1.ObjectId(postId);
                    const res = yield mongo_db_1.postsCollection.updateOne({ _id: idToCheck }, { $set: Object.assign({}, newData) });
                    if (!res.acknowledged) {
                        throw new custom_error_class_1.CustomError({
                            errorMessage: {
                                field: "postsCollection.updateOne",
                                message: "attempt to update post entry failed",
                            },
                        });
                    }
                    if (res.matchedCount === 1) {
                        // успешное выполнение
                        return null;
                    }
                }
                else {
                    throw new custom_error_class_1.CustomError({
                        errorMessage: {
                            field: "ObjectId.isValid(postId)",
                            message: "invalid post ID",
                        },
                    });
                }
            }
            catch (error) {
                if (error instanceof custom_error_class_1.CustomError) {
                    if (error.metaData) {
                        const errorData = error.metaData.errorMessage;
                        console.error(`In field: ${errorData.field} - ${errorData.message}`);
                    }
                    else {
                        console.error(`Unknown error: ${JSON.stringify(error)}`);
                    }
                    // throw new Error('Placeholder for an error in to be rethrown and dealt with in the future in createNewBlog method of dataCommandRepository');
                    return undefined;
                }
                else {
                    console.error(`Unknown error inside dataCommandRepository.updatePost: ${JSON.stringify(error)}`);
                    throw new Error("Placeholder for an error to be rethrown and dealt with in the future in updatePost method of dataCommandRepository");
                }
            }
        });
    },
    deletePost(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (mongodb_1.ObjectId.isValid(postId)) {
                    const idToCheck = new mongodb_1.ObjectId(postId);
                    const res = yield mongo_db_1.postsCollection.deleteOne({ _id: idToCheck });
                    if (!res.acknowledged) {
                        throw new custom_error_class_1.CustomError({
                            errorMessage: {
                                field: "postsCollection.deleteOne",
                                message: "attempt to delete post entry failed",
                            },
                        });
                    }
                    if (res.deletedCount === 1) {
                        return null;
                    }
                }
                else {
                    throw new custom_error_class_1.CustomError({
                        errorMessage: {
                            field: "ObjectId.isValid(postId)",
                            message: "invalid post ID",
                        },
                    });
                }
            }
            catch (error) {
                if (error instanceof custom_error_class_1.CustomError) {
                    if (error.metaData) {
                        const errorData = error.metaData.errorMessage;
                        console.error(`In field: ${errorData.field} - ${errorData.message}`);
                    }
                    else {
                        console.error(`Unknown error: ${JSON.stringify(error)}`);
                    }
                    // throw new Error('Placeholder for an error in to be rethrown and dealt with in the future in createNewBlog method of dataCommandRepository');
                    return undefined;
                }
                else {
                    console.error(`Unknown error inside dataCommandRepository.deletePost: ${JSON.stringify(error)}`);
                    throw new Error("Placeholder for an error to be rethrown and dealt with in the future in deletePost method of dataCommandRepository");
                }
            }
        });
    },
    // *****************************
    // методы для управления юзерами
    // *****************************
    // async createNewUser(
    //     sentNewUser: UserInputModel,
    // ): Promise<string | undefined> {
    //     try {
    //         const passwordHash = await BcryptService.generateHash(
    //             sentNewUser.password,
    //         );
    //         if (!passwordHash) {
    //             throw new CustomError({
    //                 errorMessage: {
    //                     field: "bcryptService.generateHash",
    //                     message: "Generating hash error",
    //                 },
    //             });
    //         }
    //
    //         const tempId = new ObjectId();
    //
    //         // нижеследующее заменили на инициализацию через клас User через extend interface UserCollectionStorageModel
    //         // const newUserEntry = {
    //         //     _id: tempId,
    //         //     id: tempId.toString(),
    //         //     login: sentNewUser.login,
    //         //     email: sentNewUser.email,
    //         //     passwordHash: passwordHash,
    //         //     createdAt: new Date(),
    //         // } as UserCollectionStorageModel;
    //
    //         const newUserEntry = new User(
    //             sentNewUser.login,
    //             sentNewUser.email,
    //             passwordHash,
    //             tempId,
    //         );
    //
    //         newUserEntry.emailConfirmation.isConfirmed = true; // для созданных админом пользователей подтверждения не нужно
    //
    //         const result = await usersCollection.insertOne(newUserEntry);
    //
    //         if (!result.acknowledged) {
    //             throw new CustomError({
    //                 errorMessage: {
    //                     field: "usersCollection.insertOne(newUserEntry)",
    //                     message: "attempt to insert new user entry failed",
    //                 },
    //             });
    //         }
    //         return result.insertedId.toString();
    //     } catch (error) {
    //         if (error instanceof CustomError) {
    //             if (error.metaData) {
    //                 const errorData = error.metaData.errorMessage;
    //                 console.error(
    //                     `In field: ${errorData.field} - ${errorData.message}`,
    //                 );
    //             } else {
    //                 console.error(`Unknown error: ${JSON.stringify(error)}`);
    //             }
    //
    //             return undefined;
    //         } else {
    //             console.error(`Unknown error: ${JSON.stringify(error)}`);
    //             throw new Error(
    //                 "Placeholder for an error to be rethrown and dealt with in the future in createNewUser method of dataCommandRepository",
    //             );
    //         }
    //     }
    // },
    // async deleteUser(userId: string): Promise<null | undefined> {
    //     try {
    //         if (ObjectId.isValid(userId)) {
    //             const idToCheck = new ObjectId(userId);
    //             const res = await usersCollection.deleteOne({ _id: idToCheck });
    //
    //             if (!res.acknowledged) {
    //                 throw new CustomError({
    //                     errorMessage: {
    //                         field: "usersCollection.deleteOne",
    //                         message: "attempt to delete user entry failed",
    //                     },
    //                 });
    //             }
    //
    //             if (res.deletedCount === 1) {
    //                 return null;
    //             }
    //         } else {
    //             return undefined;
    //         }
    //     } catch (error) {
    //         if (error instanceof CustomError) {
    //             if (error.metaData) {
    //                 const errorData = error.metaData.errorMessage;
    //                 console.error(
    //                     `In field: ${errorData.field} - ${errorData.message}`,
    //                 );
    //             } else {
    //                 console.error(`Unknown error: ${JSON.stringify(error)}`);
    //             }
    //
    //             return undefined;
    //         } else {
    //             console.error(
    //                 `Unknown error inside dataCommandRepository.deleteUser: ${JSON.stringify(error)}`,
    //             );
    //             throw new Error(
    //                 "Placeholder for an error to be rethrown and dealt with in the future in deleteUser method of dataCommandRepository",
    //             );
    //         }
    //     }
    // },
    // *****************************
    // методы для управления комментариями
    // *****************************
    createNewComment(postId, content, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //if (ObjectId.isValid(userId) && ObjectId.isValid(postId)) {
                // проверяем существует ли такой юзер и возвращаем его логин
                // ищем существует ли такой пост
                // создаем временный объект, куда записываем postId, userId, создаем и записываем id нового объекта
                const user = yield findUserByPrimaryKey(new mongodb_1.ObjectId(userId));
                if (!user) {
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.InternalServerError,
                        statusDescription: "User is not found, possibly because its token is valid but user-record was already deleted or due to an database error",
                        errorsMessages: [
                            {
                                field: "dataCommandRepository.createNewComment -> findUserByPrimaryKey(new ObjectId(userId))", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                                message: "Couldn't find User record", // ошибкам надо присваивать кода, чтобы пользователи могли сообщать номер ошибки в техподдержку
                            },
                        ],
                    };
                }
                const userLogin = user.login;
                // тут по-идее также проверка на соответствие userLogin требованиям?
                const tempId = new mongodb_1.ObjectId();
                const newCommentEntry = {
                    _id: tempId,
                    id: tempId.toString(),
                    relatedPostId: postId,
                    content: content,
                    commentatorInfo: { userId: userId, userLogin: userLogin },
                    createdAt: new Date(),
                };
                const result = yield mongo_db_1.commentsCollection.insertOne(newCommentEntry);
                if (!result.acknowledged) {
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.InternalServerError,
                        statusDescription: "Error while inserting new comment",
                        errorsMessages: [
                            {
                                field: "dataCommandRepository.createNewComment -> commentsCollection.insertOne(newCommentEntry)", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                                message: "Error while inserting new comment",
                            },
                        ],
                    };
                }
                return {
                    data: {
                        id: newCommentEntry.id,
                        content: newCommentEntry.content,
                        commentatorInfo: newCommentEntry.commentatorInfo,
                        createdAt: newCommentEntry.createdAt,
                    },
                    statusCode: http_statuses_1.HttpStatus.Created,
                    errorsMessages: [
                        {
                            field: null,
                            message: null,
                        },
                    ],
                };
            }
            catch (error) {
                console.error(`Unknown error: ${JSON.stringify(error)}`);
                // throw new Error("Placeholder for an error to be rethrown and dealt with in the future in createNewUser method of dataCommandRepository");
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: `Unknown error inside try-catch block: ${JSON.stringify(error)}`,
                    errorsMessages: [
                        {
                            field: "dataCommandRepository.createNewComment", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                            message: `Unknown error inside try-catch block: ${JSON.stringify(error)}`,
                        },
                    ],
                };
            }
        });
    },
    updateCommentById(sentCommentId, 
    //sentUserId: string,
    sentContent) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield mongo_db_1.commentsCollection.updateOne({ _id: new mongodb_1.ObjectId(sentCommentId) }, { $set: { content: sentContent.content } });
                if (!res.acknowledged) {
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.InternalServerError,
                        statusDescription: `Unknown error inside bloggersCollection.updateOne inside dataCommandRepository.updateCommentById`,
                        errorsMessages: [
                            {
                                field: "bloggersCollection.updateOne inside dataCommandRepository.updateCommentById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                                message: `Unknown error while trying to update comment`,
                            },
                        ],
                    };
                }
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.NoContent,
                    statusDescription: "",
                    errorsMessages: [
                        {
                            field: "",
                            message: "",
                        },
                    ],
                };
            }
            catch (error) {
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: `Unknown error inside try-catch block inside dataCommandRepository.updateCommentById: ${JSON.stringify(error)}`,
                    errorsMessages: [
                        {
                            field: "dataCommandRepository.updateCommentById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                            message: `Unknown error inside try-catch block: ${JSON.stringify(error)}`,
                        },
                    ],
                };
            }
        });
    },
    deleteCommentById(sentCommentId, sentUserId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const comment = yield findCommentByPrimaryKey(new mongodb_1.ObjectId(sentCommentId));
                if (!comment) {
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.InternalServerError,
                        statusDescription: `Comment is not found by sent comment ID ${sentCommentId} inside dataCommandRepository.deleteCommentById. Even though this exact ID passed existence check in middlewares previously.`,
                        errorsMessages: [
                            {
                                field: "if (!comment) inside dataCommandRepository.deleteCommentById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                                message: `Internal Server Error`,
                            },
                        ],
                    };
                }
                if (sentUserId !== comment.commentatorInfo.userId) {
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.Forbidden,
                        statusDescription: `User is forbidden to delete another user’s comment`,
                        errorsMessages: [
                            {
                                field: "if (sentUserId !== comment.commentatorInfo.userId) inside dataCommandRepository.deleteCommentById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                                message: `User is forbidden to delete another user’s comment`,
                            },
                        ],
                    };
                }
                const res = yield mongo_db_1.commentsCollection.deleteOne({
                    _id: new mongodb_1.ObjectId(sentCommentId),
                });
                if (!res.acknowledged) {
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.InternalServerError,
                        statusDescription: `Unknown error inside bloggersCollection.deleteOne inside dataCommandRepository.deleteCommentById`,
                        errorsMessages: [
                            {
                                field: "bloggersCollection.deleteOne inside dataCommandRepository.deleteCommentById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                                message: `Unknown error while trying to delete comment`,
                            },
                        ],
                    };
                }
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.NoContent,
                    statusDescription: "",
                    errorsMessages: [
                        {
                            field: "",
                            message: "",
                        },
                    ],
                };
            }
            catch (error) {
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: `Unknown error inside try-catch block inside dataCommandRepository.deleteCommentById: ${JSON.stringify(error)}`,
                    errorsMessages: [
                        {
                            field: "dataCommandRepository.deleteCommentById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                            message: `Unknown error inside try-catch block: ${JSON.stringify(error)}`,
                        },
                    ],
                };
            }
        });
    },
    // *****************************
    // методы для управления регистрацией новых пользователей
    // *****************************
    confirmRegistrationCode(sentConfirmationCode) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const searchResult = await usersCollection
                //     .aggregate([
                //         {
                //             $match: {
                //                 "emailConfirmation.confirmationCode":
                //                     sentConfirmationCode.code,
                //                 "emailConfirmation.expirationDate": {
                //                     $gt: new Date(),
                //                 },
                //                 "emailConfirmation.isConfirmed": false,
                //             },
                //         },
                //         {
                //             $project: {
                //                 _id: 1,
                //             },
                //         },
                //     ])
                //     .toArray();
                const searchResult = yield mongo_db_1.usersCollection.findOne({
                    "emailConfirmation.confirmationCode": sentConfirmationCode.code,
                    "emailConfirmation.expirationDate": { $gt: new Date() },
                    "emailConfirmation.isConfirmed": false,
                }, { projection: { _id: 1 } });
                // console.log("ALL USERS: ", searchResult);
                // console.log(
                //     "ARRAY LENGTH HERE <-------------",
                //     searchResult.length
                // );
                //
                // console.log(
                //     "FOUND HERE <-------------",
                //     searchResult[0]._id.toString()
                // );
                // aggregate() всегда возвращает массив!
                if (searchResult) {
                    const updateResult = yield mongo_db_1.usersCollection.updateOne({ _id: searchResult._id }, {
                        $set: {
                            "emailConfirmation.confirmationCode": null,
                            "emailConfirmation.isConfirmed": true,
                        },
                    });
                    if (updateResult.acknowledged) {
                        return {
                            data: null,
                            statusCode: http_statuses_1.HttpStatus.NoContent,
                            statusDescription: "Successfully confirmed user",
                            errorsMessages: [
                                {
                                    field: "",
                                    message: "",
                                },
                            ],
                        };
                    }
                    // не смогли обновить юзера
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.InternalServerError,
                        statusDescription: "Couldn't confirm user: dataCommandRepository -> confirmRegistrationCode",
                        errorsMessages: [
                            {
                                field: "",
                                message: "Couldn't confirm user",
                            },
                        ],
                    };
                }
                // юзер не был найден или просрочен
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.BadRequest,
                    statusDescription: "Couldn't confirm user: dataCommandRepository -> confirmRegistrationCode",
                    errorsMessages: [
                        {
                            field: "code",
                            message: "Couldn't confirm user - not existent or out of date",
                        },
                    ],
                };
            }
            catch (error) {
                // непредвиденная ошибка
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: "dataCommandRepository -> confirmRegistrationCode",
                    errorsMessages: [
                        {
                            field: "",
                            message: "Unknown error",
                        },
                    ],
                };
            }
        });
    },
    registerNewUser(sentNewUser) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield mongo_db_1.usersCollection.insertOne(sentNewUser);
                // newUserEntry.emailConfirmation.isConfirmed = true; // для созданных админом пользователей подтверждения не нужно
                if (!result.acknowledged) {
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.InternalServerError,
                        statusDescription: "",
                        errorsMessages: [
                            {
                                field: "dataCommandRepository -> registerNewUser -> usersCollection.insertOne(newUserEntry)",
                                message: "attempt to insert new user entry failed",
                            },
                        ],
                    };
                }
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.Ok,
                    statusDescription: "dataCommandRepository -> registerNewUser -> usersCollection.insertOne(newUserEntry)",
                    errorsMessages: [
                        {
                            field: "",
                            message: "Unknown error",
                        },
                    ],
                };
            }
            catch (error) {
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: "dataCommandRepository -> registerNewUser -> usersCollection.insertOne(newUserEntry)",
                    errorsMessages: [
                        {
                            field: "",
                            message: `Unknown error: ${error}`,
                        },
                    ],
                };
            }
        });
    },
    resendConfirmRegistrationCode(sentEmailData, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // console.log(
                //     "<--------------",
                //     userId.toString()
                // );
                const userEntry = yield mongo_db_1.usersCollection.findOne({ _id: userId }); // очень важно!! обязательнь указывать поле по которому идет поиск! '_id:', без него может не найти, хотя ошибку синтаксически не покажет
                if (!userEntry) {
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.InternalServerError,
                        statusDescription: "",
                        errorsMessages: [
                            {
                                field: "resendConfirmRegistrationCode -> usersCollection.findOne({ userId })",
                                message: "User not found",
                            },
                        ],
                    };
                }
                const newConfirmationCode = (0, node_crypto_1.randomUUID)();
                // userEntry.emailConfirmation.confirmationCode = newConfirmationCode;
                // userEntry.emailConfirmation.expirationDate = new Date(new Date().setMinutes(new Date().getMinutes() + 30));
                // const result = await usersCollection.insertOne(newUserEntry);
                // newUserEntry.emailConfirmation.isConfirmed = true; // для созданных админом пользователей подтверждения не нужно
                const result = yield mongo_db_1.usersCollection.updateOne({ _id: userId }, {
                    $set: {
                        "emailConfirmation.confirmationCode": newConfirmationCode,
                        "emailConfirmation.expirationDate": new Date(new Date().setDate(new Date().getMinutes() + 30)),
                    },
                });
                if (!result.acknowledged) {
                    return {
                        data: null,
                        statusCode: http_statuses_1.HttpStatus.InternalServerError,
                        statusDescription: "",
                        errorsMessages: [
                            {
                                field: "dataCommandRepository -> resendConfirmRegistrationCode -> usersCollection.updateOne",
                                message: "attempt to update user entry failed",
                            },
                        ],
                    };
                }
                // здесь отсылка письма. с точки зрения обработки потенциальных ошибок
                // максимум того что целесообразно сделать, это в том случае если по какой-то причине с нашей стороны чтото сломалось
                // никак не говорить об этом юзерам, пускай они самостоятельно повторно отправляют запрос, мы максимум логируем ошибку
                // тут жестко будет связано с политикой компании по этому поводу
                // так делается чтобы не брать на себя лишней работы, т.к. в случае реальной проблемы с сервисом отправки мы так или иначе будем это чинить
                // а если письмо просто потерялось или юзер тупит - для нас это может быть куча лишней работы по обслуживанию непонятно чего
                // так что во втором случае пусть юзер сам лучше на себя возьмет это работу - просто повторно отправит если что запррос, нам главно оптимально подобрать период удалления неподтвержденных данных (минут 15-30)
                const resendingResult = yield mailer_service_1.mailerService.sendConfirmationRegisterEmail('"Alex St" <geniusb198@yandex.ru>', sentEmailData.email, newConfirmationCode, mailer_service_1.emailExamples.registrationEmail);
                let status = "Resending went without problems, awaiting confirmation form user";
                if (!resendingResult) {
                    console.error("Something went while resending the registration email");
                    status =
                        "Something went wrong while resending the registration email";
                }
                // отправка результата - все ОК
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.NoContent,
                    statusDescription: status,
                    errorsMessages: [
                        {
                            field: "",
                            message: "",
                        },
                    ],
                };
            }
            catch (error) {
                return {
                    data: null,
                    statusCode: http_statuses_1.HttpStatus.InternalServerError,
                    statusDescription: "dataCommandRepository -> resendConfirmRegistrationCode -> usersCollection.updateOne",
                    errorsMessages: [
                        {
                            field: "",
                            message: "Unknown error",
                        },
                    ],
                };
            }
        });
    },
    findByLoginOrEmail(loginOrEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield mongo_db_1.usersCollection.findOne({
                    //"emailConfirmation.isConfirmed": false,
                    $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
                }, 
                // т.к. нам не нужны все данные по юзеру, то оптимизируем - запрашиваем только _id
                { projection: { _id: 1 } });
                return !!user;
            }
            catch (error) {
                // не оптимально, но пока не унифицирован подход к обработке ошибок - оставляем
                console.error("Internal DB error in dataCommandRepository -> findByLoginOrEmail:", error);
                return false;
            }
        });
    },
    findNotConfirmedByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield mongo_db_1.usersCollection.findOne({
                    "emailConfirmation.isConfirmed": false,
                    email: email,
                }, { projection: { _id: 1 } });
                return user ? user._id : null;
            }
            catch (error) {
                // не оптимально, но пока не унифицирован подход к обработке ошибок - оставляем
                console.error("Internal DB error in dataCommandRepository -> findNotConfirmedByEmail:", error);
                return null;
            }
        });
    },
    // *****************************
    // методы для управления черным списком (black list) рефреш токенов (refresh tokens) пользователей
    // *****************************
    addRefreshTokenInfoToBlackList(refreshTokenInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield mongo_db_1.refreshTokensBlackListCollection.insertOne(refreshTokenInfo);
                return !!result;
            }
            catch (error) {
                console.error("Unknown error during addRefreshTokenInfoToBlackList", error);
                return false;
            }
        });
    },
    checkIfRefreshTokenInBlackList(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield mongo_db_1.refreshTokensBlackListCollection.findOne({ refreshToken: refreshToken }, { projection: { _id: 1 } });
                return !!result;
            }
            catch (error) {
                console.error("Unknown error during checkIfRefreshTokenInBlackList", error);
                return false;
            }
        });
    },
    findAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return mongo_db_1.usersCollection.find({}).toArray();
        });
    },
    // *****************************
    // методы для управления сессиями, а также управления сущностью security devices
    // *****************************
    // // export type SessionStorageModel = {
    // //     userId: string;
    // //     deviceId: string;
    // //     issuedAt: Date;
    // //     deviceName: string;
    // //     deviceIp: string;
    // //     expiresAt: Date;
    // // }
    //
    // // там где этот метод используется для гварда - айдишник сессии в базе передаем через req, чтобы впоследствии можно было быстро найти данную сессию
    // async findSession(
    //     userId: string,
    //     deviceId: string,
    //     expiresAt: Date,
    //     issuedAt: Date,
    // ): Promise<ObjectId | null> {
    //     try {
    //         const session=
    //             await sessionsDataStorage.findOne(
    //                 {
    //                     userId: userId,
    //                     deviceId: deviceId,
    //                     expiresAt: expiresAt,
    //                     issuedAt: issuedAt,
    //                 },
    //                 { projection: { _id: 1 } },
    //             );
    //
    //         return session ? session._id : null;
    //     } catch (error) {
    //         console.error("Unknown error during findSession", error);
    //
    //         return null;
    //     }
    // },
    //
    // async createSession(sessionDto: UserSession): Promise<boolean> {
    //     try {
    //         const result = await sessionsDataStorage.insertOne(sessionDto);
    //
    //         return !!result;
    //     } catch (error) {
    //         console.error("Unknown error during createSession", error);
    //
    //         return false;
    //     }
    // },
    //
    // async updateSession(
    //     expiresAt: Date,
    //     issuedAt: Date,
    //     sessionIndexId: ObjectId,
    // ): Promise<boolean | null> {
    //     try {
    //         const result = await sessionsDataStorage.updateOne(
    //             { _id: sessionIndexId },
    //             {
    //                 $set: {
    //                     expiresAt: expiresAt,
    //                     issuedAt: issuedAt,
    //                 },
    //             },
    //         );
    //
    //         if (!result.acknowledged) {
    //             console.error("Couldn't update session inside updateSession");
    //
    //             return null;
    //         }
    //
    //         return !!result;
    //     } catch (error) {
    //         console.error("Unknown error inside findSession", error);
    //
    //         return null;
    //     }
    // },
    //
    // async removeSessionBySessionId(sessionId: ObjectId): Promise<undefined | null> {
    //     try {
    //         const result = await sessionsDataStorage.deleteOne({
    //             _id: sessionId,
    //         });
    //
    //         if (!result.acknowledged) {
    //             console.error("Couldn't remove session inside removeSessionBySessionId");
    //
    //             return undefined;
    //         }
    //
    //         return null;
    //     }catch(error) {
    //         console.error("Unknown error inside removeSessionBySessionId", error);
    //
    //         return undefined;
    //     }
    // },
    //
    //
    // async removeSessionByDeviceId(deviceId: string): Promise<undefined | null> {
    //     try {
    //         const result = await sessionsDataStorage.deleteOne({
    //             deviceId: deviceId,
    //         });
    //
    //         if (!result.acknowledged) {
    //             console.error("Couldn't remove session inside removeSessionByDeviceId");
    //
    //             return undefined;
    //         }
    //
    //         return null;
    //     }catch(error) {
    //         console.error("Unknown error inside removeSessionByDeviceId", error);
    //
    //         return undefined;
    //     }
    // },
    //
    //
    // async removeAllButOneSession(sessionId: ObjectId, userId:string): Promise<undefined | null> {
    //     try {
    //         const result = await sessionsDataStorage.deleteMany({
    //             userId: userId,
    //             _id: { $ne: sessionId }
    //         });
    //
    //         if (!result.acknowledged) {
    //             console.error("Couldn't remove sessions inside removeAllButOneSession");
    //
    //             return undefined;
    //         }
    //
    //         return null;
    //     }catch(error) {
    //         console.error("Unknown error inside removeAllButOneSession", error);
    //
    //         return undefined;
    //     }
    // },
    insertUrlCall(uslCall) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield mongo_db_1.requestsRestrictionDataStorage.insertOne(uslCall);
                return !!result;
            }
            catch (error) {
                console.error("Unknown error inside insertUrlCall", error);
                return false;
            }
        });
    },
    // *****************************
    // методы для тестов
    // *****************************
    deleteAllBloggers() {
        return __awaiter(this, void 0, void 0, function* () {
            yield mongo_db_1.bloggersCollection.deleteMany({});
            yield mongo_db_1.postsCollection.deleteMany({});
            yield mongo_db_1.usersCollection.deleteMany({});
            yield mongo_db_1.commentsCollection.deleteMany({});
            yield mongo_db_1.refreshTokensBlackListCollection.deleteMany({});
            yield mongo_db_1.sessionsDataStorage.deleteMany({});
            yield mongo_db_1.requestsRestrictionDataStorage.deleteMany({});
        });
    },
};
