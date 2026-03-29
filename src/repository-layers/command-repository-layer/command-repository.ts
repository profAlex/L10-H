import { BlogInputModel } from "../../routers/router-types/blog-input-model";
import { PostViewModel } from "../../routers/router-types/post-view-model";
import { PostInputModel } from "../../routers/router-types/post-input-model";
import {
    bloggersCollection,
    commentsCollection,
    postsCollection,
    usersCollection,
    refreshTokensBlackListCollection,
    sessionsDataStorage,
    requestsRestrictionDataStorage,
} from "../../db/mongo.db";
import { ObjectId, WithId } from "mongodb";
import { BlogPostInputModel } from "../../routers/router-types/blog-post-input-model";
import { CustomError } from "../utility/custom-error-class";
import { UserInputModel } from "../../routers/router-types/user-input-model";
import { UserCollectionStorageModel } from "../../routers/router-types/user-storage-model";
import { CommentViewModel } from "../../routers/router-types/comment-view-model";
import { CustomResult } from "../../common/result-type/result-type";
import { HttpStatus } from "../../common/http-statuses/http-statuses";
import { CommentStorageModel } from "../../routers/router-types/comment-storage-model";
import { CommentInputModel } from "../../routers/router-types/comment-input-model";
import { User } from "../../common/classes/user-class";
import {
    emailExamples,
    mailerService,
} from "../../adapters/email-sender/mailer-service";
import { RegistrationConfirmationInput } from "../../routers/router-types/auth-registration-confirmation-input-model";
import { ResentRegistrationConfirmationInput } from "../../routers/router-types/auth-resent-registration-confirmation-input-model";
import { randomUUID } from "node:crypto";
import { RefreshTokenModel } from "../../adapters/verification/auth-refresh-token-model";
import { UserSession } from "../../common/classes/session-class";
import { SessionStorageModel } from "../../routers/router-types/auth-SessionStorageModel";
import { RequestRestrictionStorageModel } from "../../routers/router-types/auth-RequestRestrictionStorageModel";
import { BcryptService } from "../../adapters/authentication/bcrypt-service";
import { PasswordRecoveryInputModel } from "../../routers/router-types/auth-password-recovery-input-model";
import { NewPasswordRecoveryInputModel } from "../../routers/router-types/auth-new-password-recovery-input-model";
import { bcryptService } from "../../composition-root/composition-root";

export type BloggerCollectionStorageModel = {
    _id: ObjectId;
    id: string;
    name: string;
    description: string;
    websiteUrl: string;
    createdAt: Date;
    isMembership: boolean;
};

export type PostCollectionStorageModel = {
    _id: ObjectId;
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: Date;
};

async function findBlogByPrimaryKey(
    id: ObjectId,
): Promise<BloggerCollectionStorageModel | null> {
    return bloggersCollection.findOne({ _id: id });
}

async function findPostByPrimaryKey(
    id: ObjectId,
): Promise<PostCollectionStorageModel | null> {
    return postsCollection.findOne({ _id: id });
}

async function findUserByPrimaryKey(
    id: ObjectId,
): Promise<UserCollectionStorageModel | null> {
    return usersCollection.findOne({ _id: id });
}

export async function findCommentByPrimaryKey(
    id: ObjectId,
): Promise<CommentStorageModel | null> {
    return commentsCollection.findOne({ _id: id });
}

export async function findSessionByPrimaryKey(
    id: ObjectId,
): Promise<SessionStorageModel | null> {
    return sessionsDataStorage.findOne({ _id: id });
}

export const dataCommandRepository = {
    // *****************************
    // методы для управления блогами
    // *****************************

    async createNewBlog(newBlog: BlogInputModel): Promise<string | undefined> {
        try {
            const tempId = new ObjectId();
            const newBlogEntry = {
                _id: tempId,
                id: tempId.toString(),
                ...newBlog,
                createdAt: new Date(),
                isMembership: false,
            } as BloggerCollectionStorageModel;

            const result = await bloggersCollection.insertOne(newBlogEntry);

            if (!result.acknowledged) {
                throw new CustomError({
                    errorMessage: {
                        field: "bloggersCollection.insertOne(newBlogEntry)",
                        message: "attempt to insert new blog entry failed",
                    },
                });
            }

            return result.insertedId.toString();
        } catch (error) {
            if (error instanceof CustomError) {
                if (error.metaData) {
                    const errorData = error.metaData.errorMessage;
                    console.error(
                        `In field: ${errorData.field} - ${errorData.message}`,
                    );
                } else {
                    console.error(`Unknown error: ${JSON.stringify(error)}`);
                }

                // throw new Error('Placeholder for an error in to be rethrown and dealt with in the future in createNewBlog method of dataCommandRepository');
                return undefined;
            } else {
                console.error(`Unknown error: ${JSON.stringify(error)}`);
                throw new Error(
                    "Placeholder for an error to be rethrown and dealt with in the future in createNewBlog method of dataCommandRepository",
                );
            }
        }
    },

    async updateBlog(
        blogId: string,
        newData: BlogInputModel,
    ): Promise<null | undefined> {
        try {
            if (ObjectId.isValid(blogId)) {
                const idToCheck = new ObjectId(blogId);
                const res = await bloggersCollection.updateOne(
                    { _id: idToCheck },
                    { $set: { ...newData } },
                );

                if (!res.acknowledged) {
                    throw new CustomError({
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
            } else {
                throw new CustomError({
                    errorMessage: {
                        field: "ObjectId.isValid(blogId)",
                        message: "invalid blog ID",
                    },
                });
            }
        } catch (error) {
            if (error instanceof CustomError) {
                if (error.metaData) {
                    const errorData = error.metaData.errorMessage;
                    console.error(
                        `In field: ${errorData.field} - ${errorData.message}`,
                    );
                } else {
                    console.error(`Unknown error: ${JSON.stringify(error)}`);
                }

                return undefined;
            } else {
                console.error(
                    `Unknown error inside dataCommandRepository.updateBlog: ${JSON.stringify(error)}`,
                );
                throw new Error(
                    "Placeholder for an error to be rethrown and dealt with in the future in updateBlog method of dataCommandRepository",
                );
            }
        }
    },

    async deleteBlog(blogId: string): Promise<null | undefined> {
        try {
            if (ObjectId.isValid(blogId)) {
                const idToCheck = new ObjectId(blogId);
                const res = await bloggersCollection.deleteOne({
                    _id: idToCheck,
                });

                if (!res.acknowledged) {
                    throw new CustomError({
                        errorMessage: {
                            field: "bloggersCollection.deleteOne",
                            message: "attempt to delete blog entry failed",
                        },
                    });
                }

                if (res.deletedCount === 1) {
                    return null;
                }
            } else {
                return undefined;
            }
        } catch (error) {
            if (error instanceof CustomError) {
                if (error.metaData) {
                    const errorData = error.metaData.errorMessage;
                    console.error(
                        `In field: ${errorData.field} - ${errorData.message}`,
                    );
                } else {
                    console.error(`Unknown error: ${JSON.stringify(error)}`);
                }

                // throw new Error('Placeholder for an error in to be rethrown and dealt with in the future in createNewBlog method of dataCommandRepository');
                return undefined;
            } else {
                console.error(
                    `Unknown error inside dataCommandRepository.deleteBlog: ${JSON.stringify(error)}`,
                );
                throw new Error(
                    "Placeholder for an error to be rethrown and dealt with in the future in deleteBlog method of dataCommandRepository",
                );
            }
        }
    },

    // *****************************
    // методы для управления постами
    // *****************************
    async getAllPosts(): Promise<PostViewModel[] | []> {
        const tempContainer: PostCollectionStorageModel[] | [] =
            await postsCollection.find({}).toArray();

        return tempContainer.map((value: PostCollectionStorageModel) => ({
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
    },

    async createNewPost(newPost: PostInputModel): Promise<string | undefined> {
        try {
            if (ObjectId.isValid(newPost.blogId)) {
                const relatedBlogger = await findBlogByPrimaryKey(
                    new ObjectId(newPost.blogId),
                );
                const tempId = new ObjectId();

                if (relatedBlogger) {
                    const newPostEntry = {
                        _id: tempId,
                        id: tempId.toString(),
                        ...newPost,
                        blogName: relatedBlogger.name,
                        createdAt: new Date(),
                    } as PostCollectionStorageModel;

                    const result =
                        await postsCollection.insertOne(newPostEntry);
                    if (!result.acknowledged) {
                        throw new CustomError({
                            errorMessage: {
                                field: "postsCollection.insertOne(newPostEntry)",
                                message:
                                    "attempt to insert new post entry failed",
                            },
                        });
                    }

                    return result.insertedId.toString();
                } else {
                    throw new CustomError({
                        errorMessage: {
                            field: "findBlogByPrimaryKey(new ObjectId(newPost.blogId))",
                            message: "attempt to find blogger failed",
                        },
                    });
                }
            } else {
                throw new CustomError({
                    errorMessage: {
                        field: "ObjectId.isValid(newPost.blogId)",
                        message: "invalid blogId",
                    },
                });
            }
        } catch (error) {
            if (error instanceof CustomError) {
                if (error.metaData) {
                    const errorData = error.metaData.errorMessage;
                    console.error(
                        `In field: ${errorData.field} - ${errorData.message}`,
                    );
                } else {
                    console.error(`Unknown error: ${JSON.stringify(error)}`);
                }

                // throw new Error('Placeholder for an error in to be rethrown and dealt with in the future in createNewBlog method of dataCommandRepository');
                return undefined;
            } else {
                console.error(
                    `Unknown error inside dataCommandRepository.createNewPost: ${JSON.stringify(error)}`,
                );
                throw new Error(
                    "Placeholder for an error to be rethrown and dealt with in the future in createNewPost method of dataCommandRepository",
                );
            }
        }
    },

    async createNewBlogPost(
        sentBlogId: string,
        newPost: BlogPostInputModel,
    ): Promise<string | undefined> {
        try {
            if (ObjectId.isValid(sentBlogId)) {
                const relatedBlogger = await findBlogByPrimaryKey(
                    new ObjectId(sentBlogId),
                );
                const tempId = new ObjectId();

                if (relatedBlogger) {
                    const newPostEntry = {
                        _id: tempId,
                        id: tempId.toString(),
                        ...newPost,
                        blogId: sentBlogId,
                        blogName: relatedBlogger.name,
                        createdAt: new Date(),
                    } as PostCollectionStorageModel;

                    const result =
                        await postsCollection.insertOne(newPostEntry);
                    if (!result.acknowledged) {
                        throw new CustomError({
                            errorMessage: {
                                field: "postsCollection.insertOne(newPostEntry)",
                                message:
                                    "attempt to insert new post entry failed",
                            },
                        });
                    }

                    return result.insertedId.toString();
                }
            }
        } catch (error) {
            if (error instanceof CustomError) {
                if (error.metaData) {
                    const errorData = error.metaData.errorMessage;
                    console.error(
                        `In field: ${errorData.field} - ${errorData.message}`,
                    );
                } else {
                    console.error(`Unknown error: ${JSON.stringify(error)}`);
                }

                // throw new Error('Placeholder for an error in to be rethrown and dealt with in the future in createNewBlog method of dataCommandRepository');
                return undefined;
            } else {
                console.error(`Unknown error: ${JSON.stringify(error)}`);
                throw new Error(
                    "Placeholder for an error to be rethrown and dealt with in the future in createNewBlogPost method of dataCommandRepository",
                );
            }
        }
    },

    async updatePost(
        postId: string,
        newData: PostInputModel,
    ): Promise<null | undefined> {
        try {
            if (ObjectId.isValid(postId)) {
                const idToCheck = new ObjectId(postId);
                const res = await postsCollection.updateOne(
                    { _id: idToCheck },
                    { $set: { ...newData } },
                );

                if (!res.acknowledged) {
                    throw new CustomError({
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
            } else {
                throw new CustomError({
                    errorMessage: {
                        field: "ObjectId.isValid(postId)",
                        message: "invalid post ID",
                    },
                });
            }
        } catch (error) {
            if (error instanceof CustomError) {
                if (error.metaData) {
                    const errorData = error.metaData.errorMessage;
                    console.error(
                        `In field: ${errorData.field} - ${errorData.message}`,
                    );
                } else {
                    console.error(`Unknown error: ${JSON.stringify(error)}`);
                }

                // throw new Error('Placeholder for an error in to be rethrown and dealt with in the future in createNewBlog method of dataCommandRepository');
                return undefined;
            } else {
                console.error(
                    `Unknown error inside dataCommandRepository.updatePost: ${JSON.stringify(error)}`,
                );
                throw new Error(
                    "Placeholder for an error to be rethrown and dealt with in the future in updatePost method of dataCommandRepository",
                );
            }
        }
    },

    async deletePost(postId: string): Promise<null | undefined> {
        try {
            if (ObjectId.isValid(postId)) {
                const idToCheck = new ObjectId(postId);
                const res = await postsCollection.deleteOne({ _id: idToCheck });

                if (!res.acknowledged) {
                    throw new CustomError({
                        errorMessage: {
                            field: "postsCollection.deleteOne",
                            message: "attempt to delete post entry failed",
                        },
                    });
                }

                if (res.deletedCount === 1) {
                    return null;
                }
            } else {
                throw new CustomError({
                    errorMessage: {
                        field: "ObjectId.isValid(postId)",
                        message: "invalid post ID",
                    },
                });
            }
        } catch (error) {
            if (error instanceof CustomError) {
                if (error.metaData) {
                    const errorData = error.metaData.errorMessage;
                    console.error(
                        `In field: ${errorData.field} - ${errorData.message}`,
                    );
                } else {
                    console.error(`Unknown error: ${JSON.stringify(error)}`);
                }

                // throw new Error('Placeholder for an error in to be rethrown and dealt with in the future in createNewBlog method of dataCommandRepository');
                return undefined;
            } else {
                console.error(
                    `Unknown error inside dataCommandRepository.deletePost: ${JSON.stringify(error)}`,
                );
                throw new Error(
                    "Placeholder for an error to be rethrown and dealt with in the future in deletePost method of dataCommandRepository",
                );
            }
        }
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
    async createNewComment(
        postId: string,
        content: string,
        userId: string,
    ): Promise<CustomResult<CommentViewModel>> {
        try {
            //if (ObjectId.isValid(userId) && ObjectId.isValid(postId)) {
            // проверяем существует ли такой юзер и возвращаем его логин
            // ищем существует ли такой пост
            // создаем временный объект, куда записываем postId, userId, создаем и записываем id нового объекта
            const user = await findUserByPrimaryKey(new ObjectId(userId));

            if (!user) {
                return {
                    data: null,
                    statusCode: HttpStatus.InternalServerError,
                    statusDescription:
                        "User is not found, possibly because its token is valid but user-record was already deleted or due to an database error",
                    errorsMessages: [
                        {
                            field: "dataCommandRepository.createNewComment -> findUserByPrimaryKey(new ObjectId(userId))", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                            message: "Couldn't find User record", // ошибкам надо присваивать кода, чтобы пользователи могли сообщать номер ошибки в техподдержку
                        },
                    ],
                } as CustomResult<CommentViewModel>;
            }
            const userLogin = user.login;
            // тут по-идее также проверка на соответствие userLogin требованиям?

            const tempId = new ObjectId();
            const newCommentEntry = {
                _id: tempId,
                id: tempId.toString(),
                relatedPostId: postId,
                content: content,
                commentatorInfo: { userId: userId, userLogin: userLogin },
                createdAt: new Date(),
            } as CommentStorageModel;

            const result = await commentsCollection.insertOne(newCommentEntry);

            if (!result.acknowledged) {
                return {
                    data: null,
                    statusCode: HttpStatus.InternalServerError,
                    statusDescription: "Error while inserting new comment",
                    errorsMessages: [
                        {
                            field: "dataCommandRepository.createNewComment -> commentsCollection.insertOne(newCommentEntry)", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                            message: "Error while inserting new comment",
                        },
                    ],
                } as CustomResult<CommentViewModel>;
            }

            return {
                data: {
                    id: newCommentEntry.id,
                    content: newCommentEntry.content,
                    commentatorInfo: newCommentEntry.commentatorInfo,
                    createdAt: newCommentEntry.createdAt,
                } as CommentViewModel,
                statusCode: HttpStatus.Created,
                errorsMessages: [
                    {
                        field: null,
                        message: null,
                    },
                ],
            };
        } catch (error) {
            console.error(`Unknown error: ${JSON.stringify(error)}`);
            // throw new Error("Placeholder for an error to be rethrown and dealt with in the future in createNewUser method of dataCommandRepository");
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription: `Unknown error inside try-catch block: ${JSON.stringify(error)}`,
                errorsMessages: [
                    {
                        field: "dataCommandRepository.createNewComment", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                        message: `Unknown error inside try-catch block: ${JSON.stringify(error)}`,
                    },
                ],
            } as CustomResult<CommentViewModel>;
        }
    },

    async updateCommentById(
        sentCommentId: string,
        //sentUserId: string,
        sentContent: CommentInputModel,
    ): Promise<CustomResult> {
        try {
            const res = await commentsCollection.updateOne(
                { _id: new ObjectId(sentCommentId) },
                { $set: { content: sentContent.content } },
            );

            if (!res.acknowledged) {
                return {
                    data: null,
                    statusCode: HttpStatus.InternalServerError,
                    statusDescription: `Unknown error inside bloggersCollection.updateOne inside dataCommandRepository.updateCommentById`,
                    errorsMessages: [
                        {
                            field: "bloggersCollection.updateOne inside dataCommandRepository.updateCommentById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                            message: `Unknown error while trying to update comment`,
                        },
                    ],
                } as CustomResult;
            }

            return {
                data: null,
                statusCode: HttpStatus.NoContent,
                statusDescription: "",
                errorsMessages: [
                    {
                        field: "",
                        message: "",
                    },
                ],
            } as CustomResult;
        } catch (error) {
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription: `Unknown error inside try-catch block inside dataCommandRepository.updateCommentById: ${JSON.stringify(
                    error,
                )}`,
                errorsMessages: [
                    {
                        field: "dataCommandRepository.updateCommentById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                        message: `Unknown error inside try-catch block: ${JSON.stringify(error)}`,
                    },
                ],
            } as CustomResult;
        }
    },

    async deleteCommentById(
        sentCommentId: string,
        sentUserId: string,
    ): Promise<CustomResult> {
        try {
            const comment = await findCommentByPrimaryKey(
                new ObjectId(sentCommentId),
            );

            if (!comment) {
                return {
                    data: null,
                    statusCode: HttpStatus.InternalServerError,
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
                    statusCode: HttpStatus.Forbidden,
                    statusDescription: `User is forbidden to delete another user’s comment`,
                    errorsMessages: [
                        {
                            field: "if (sentUserId !== comment.commentatorInfo.userId) inside dataCommandRepository.deleteCommentById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                            message: `User is forbidden to delete another user’s comment`,
                        },
                    ],
                };
            }

            const res = await commentsCollection.deleteOne({
                _id: new ObjectId(sentCommentId),
            });

            if (!res.acknowledged) {
                return {
                    data: null,
                    statusCode: HttpStatus.InternalServerError,
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
                statusCode: HttpStatus.NoContent,
                statusDescription: "",
                errorsMessages: [
                    {
                        field: "",
                        message: "",
                    },
                ],
            };
        } catch (error) {
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription: `Unknown error inside try-catch block inside dataCommandRepository.deleteCommentById: ${JSON.stringify(
                    error,
                )}`,
                errorsMessages: [
                    {
                        field: "dataCommandRepository.deleteCommentById", // это служебная и отладочная информация, к ней НЕ должен иметь доступ фронтенд, обрабатываем внутри периметра работы бэкэнда
                        message: `Unknown error inside try-catch block: ${JSON.stringify(error)}`,
                    },
                ],
            };
        }
    },

    // *****************************
    // методы для управления регистрацией новых пользователей
    // *****************************
    async confirmRegistrationCode(
        sentConfirmationData: RegistrationConfirmationInput,
    ): Promise<CustomResult> {
        try {
            // const searchResult = await usersCollection
            //     .aggregate([
            //         {
            //             $match: {
            //                 "emailConfirmation.confirmationCode":
            //                     sentConfirmationData.code,
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

            const searchResult = await usersCollection.findOne(
                {
                    "emailConfirmation.confirmationCode":
                        sentConfirmationData.code,
                    "emailConfirmation.expirationDate": { $gt: new Date() },
                    "emailConfirmation.isConfirmed": false,
                },
                { projection: { _id: 1 } },
            );

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
                const updateResult = await usersCollection.updateOne(
                    { _id: searchResult._id },
                    {
                        $set: {
                            "emailConfirmation.confirmationCode": null,
                            "emailConfirmation.isConfirmed": true,
                        },
                    },
                );

                if (updateResult.acknowledged) {
                    return {
                        data: null,
                        statusCode: HttpStatus.NoContent,
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
                    statusCode: HttpStatus.InternalServerError,
                    statusDescription:
                        "Couldn't confirm user: dataCommandRepository -> confirmRegistrationCode",
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
                statusCode: HttpStatus.BadRequest,
                statusDescription:
                    "Couldn't confirm user: dataCommandRepository -> confirmRegistrationCode",
                errorsMessages: [
                    {
                        field: "code",
                        message:
                            "Couldn't confirm user - not existent or out of date",
                    },
                ],
            };
        } catch (error) {
            // непредвиденная ошибка
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription:
                    "dataCommandRepository -> confirmRegistrationCode",
                errorsMessages: [
                    {
                        field: "",
                        message: "Unknown error",
                    },
                ],
            };
        }
    },

    async confirmPasswordRecoveryCode(
        sentConfirmationData: NewPasswordRecoveryInputModel,
    ): Promise<CustomResult> {
        try {
            // const searchResult = await usersCollection
            //     .aggregate([
            //         {
            //             $match: {
            //                 "emailConfirmation.confirmationCode":
            //                     sentConfirmationData.code,
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

            const searchResult = await usersCollection.findOne(
                {
                    "passwordRecoveryInformation.passwordRecoveryCode":
                    sentConfirmationData.recoveryCode,
                    "passwordRecoveryInformation.expirationDate": { $gt: new Date() },
                    "passwordRecoveryInformation.isRecoveryInAction": true,
                },
                { projection: { _id: 1 } },
            );

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
                // если юзер с заданными характеристиками нашелся - генерируем новый хэш для пароля и пробуем обновить его
                const newPasswordHash = await bcryptService.generateHash(
                    sentConfirmationData.newPassword
                );

                if (!newPasswordHash) {
                    return {
                        data: null,
                        statusCode: HttpStatus.InternalServerError,
                        statusDescription: "Error inside dataCommandRepository -> confirmPasswordRecoveryCode -> bcryptService.generateHash",
                        errorsMessages: [
                            {
                                field: "bcryptService.generateHash",
                                message: "Generating hash error"
                            }
                        ]
                    };
                }
                
                const updateResult = await usersCollection.updateOne(
                    { _id: searchResult._id },
                    {
                        $set: {
                            passwordHash: newPasswordHash,
                            "passwordRecoveryInformation.confirmationCode": null,
                            "passwordRecoveryInformation.isRecoveryInAction": false,
                        },
                    },
                );

                if (updateResult.acknowledged) {
                    return {
                        data: null,
                        statusCode: HttpStatus.NoContent,
                        statusDescription: "Successfully confirmed new password",
                        errorsMessages: [
                            {
                                field: "",
                                message: "",
                            },
                        ],
                    };
                }

                // не смогли обновить данные нового пароля
                return {
                    data: null,
                    statusCode: HttpStatus.InternalServerError,
                    statusDescription:
                        "Couldn't confirm new password: dataCommandRepository -> confirmPasswordRecoveryCode",
                    errorsMessages: [
                        {
                            field: "",
                            message: "Couldn't confirm password",
                        },
                    ],
                };
            }

            // юзер не был найден или просрочен
            return {
                data: null,
                statusCode: HttpStatus.BadRequest,
                statusDescription:
                    "Couldn't confirm new password: dataCommandRepository -> confirmPasswordRecoveryCode",
                errorsMessages: [
                    {
                        field: "code",
                        message:
                            "Couldn't confirm new password - not existent or out of date",
                    },
                ],
            };
        } catch (error) {
            // непредвиденная ошибка
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription:
                    "dataCommandRepository -> confirmPasswordRecoveryCode",
                errorsMessages: [
                    {
                        field: "",
                        message: "Unknown error",
                    },
                ],
            };
        }
    },

    async registerNewUser(sentNewUser: User): Promise<CustomResult> {
        try {
            const result = await usersCollection.insertOne(sentNewUser);
            // newUserEntry.emailConfirmation.isConfirmed = true; // для созданных админом пользователей подтверждения не нужно

            if (!result.acknowledged) {
                return {
                    data: null,
                    statusCode: HttpStatus.InternalServerError,
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
                statusCode: HttpStatus.Ok,
                statusDescription:
                    "dataCommandRepository -> registerNewUser -> usersCollection.insertOne(newUserEntry)",
                errorsMessages: [
                    {
                        field: "",
                        message: "Unknown error",
                    },
                ],
            };
        } catch (error) {
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription:
                    "dataCommandRepository -> registerNewUser -> usersCollection.insertOne(newUserEntry)",
                errorsMessages: [
                    {
                        field: "",
                        message: `Unknown error: ${error}`,
                    },
                ],
            };
        }
    },

    async resendConfirmRegistrationCode(
        sentEmailData: ResentRegistrationConfirmationInput,
        userId: ObjectId,
    ): Promise<CustomResult> {
        try {
            // console.log(
            //     "<--------------",
            //     userId.toString()
            // );

            const userEntry = await usersCollection.findOne({ _id: userId }); // очень важно!! обязательнь указывать поле по которому идет поиск! '_id:', без него может не найти, хотя ошибку синтаксически не покажет

            if (!userEntry) {
                return {
                    data: null,
                    statusCode: HttpStatus.InternalServerError,
                    statusDescription: "",
                    errorsMessages: [
                        {
                            field: "resendConfirmRegistrationCode -> usersCollection.findOne({ userId })",
                            message: "User not found",
                        },
                    ],
                };
            }

            const newConfirmationCode = randomUUID();
            // userEntry.emailConfirmation.confirmationCode = newConfirmationCode;
            // userEntry.emailConfirmation.expirationDate = new Date(new Date().setMinutes(new Date().getMinutes() + 30));

            // const result = await usersCollection.insertOne(newUserEntry);
            // newUserEntry.emailConfirmation.isConfirmed = true; // для созданных админом пользователей подтверждения не нужно

            const result = await usersCollection.updateOne(
                { _id: userId },
                {
                    $set: {
                        "emailConfirmation.confirmationCode":
                            newConfirmationCode,
                        "emailConfirmation.expirationDate": new Date(
                            new Date().setDate(new Date().getMinutes() + 30),
                        ),
                    },
                },
            );

            if (!result.acknowledged) {
                return {
                    data: null,
                    statusCode: HttpStatus.InternalServerError,
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

            const resendingResult =
                await mailerService.sendEmailWithCode(
                    '"Alex St" <geniusb198@yandex.ru>',
                    sentEmailData.email,
                    newConfirmationCode,
                    emailExamples.registrationEmail,
                );

            let status =
                "Resending went without problems, awaiting confirmation form user";
            if (!resendingResult) {
                console.error(
                    "Something went while resending the registration email",
                );
                status =
                    "Something went wrong while resending the registration email";
            }

            // отправка результата - все ОК
            return {
                data: null,
                statusCode: HttpStatus.NoContent,
                statusDescription: status,
                errorsMessages: [
                    {
                        field: "",
                        message: "",
                    },
                ],
            };
        } catch (error) {
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription:
                    "dataCommandRepository -> resendConfirmRegistrationCode",
                errorsMessages: [
                    {
                        field: "",
                        message: "Unknown error",
                    },
                ],
            };
        }
    },

    async sendPasswordRecoveryInfo(
        sentEmailData: PasswordRecoveryInputModel,
        userId: ObjectId,
    ): Promise<CustomResult> {
        try {
            // console.log(
            //     "<--------------",
            //     userId.toString()
            // );

            const userEntry = await usersCollection.findOne({ _id: userId }); // очень важно!! обязательнь указывать поле по которому идет поиск! '_id:', без него может не найти, хотя ошибку синтаксически не покажет

            if (!userEntry) {
                return {
                    data: null,
                    statusCode: HttpStatus.InternalServerError,
                    statusDescription: "",
                    errorsMessages: [
                        {
                            field: "sendPasswordRecoveryInfo -> usersCollection.findOne({ userId })",
                            message: "User not found",
                        },
                    ],
                };
            }

            const newRecoveryCode = randomUUID();

            const result = await usersCollection.updateOne(
                { _id: userId },
                {
                    $set: {
                        "passwordRecoveryInformation.passwordRecoveryCode":
                            newRecoveryCode,
                        "passwordRecoveryInformation.expirationDate": new Date(
                            new Date().setDate(new Date().getMinutes() + 3000), // здесь значение 3000 просто специально оч большое, вообще этой функциональности не было заложено в ТЗ, заложил ее на будущее, можно и убрать
                        ),
                        "passwordRecoveryInformation.isRecoveryInAction": true,
                    },
                },
            );

            if (!result.acknowledged) {
                return {
                    data: null,
                    statusCode: HttpStatus.InternalServerError,
                    statusDescription: "",
                    errorsMessages: [
                        {
                            field: "dataCommandRepository -> sendPasswordRecoveryInfo -> usersCollection.updateOne",
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

            const sendingResult =
                await mailerService.sendEmailWithCode(
                    '"Alex St" <geniusb198@yandex.ru>',
                    sentEmailData.email,
                    newRecoveryCode,
                    emailExamples.passwordRecoveryEmail,
                );

            let status =
                "Sending recovery email went without problems, awaiting confirmation form user";
            if (!sendingResult) {
                console.error(
                    "Something went while sending the recovery email",
                );
                status =
                    "Something went wrong while sending the recovery email";
            }

            // отправка результата - все ОК
            return {
                data: null,
                statusCode: HttpStatus.NoContent,
                statusDescription: status,
                errorsMessages: [
                    {
                        field: "",
                        message: "",
                    },
                ],
            };
        } catch (error) {
            return {
                data: null,
                statusCode: HttpStatus.InternalServerError,
                statusDescription:
                    "dataCommandRepository -> sendPasswordRecoveryInfo",
                errorsMessages: [
                    {
                        field: "",
                        message: "Unknown error",
                    },
                ],
            };
        }
    },

    async findByLoginOrEmail(loginOrEmail: string): Promise<boolean> {
        try {
            const user = await usersCollection.findOne(
                {
                    //"emailConfirmation.isConfirmed": false,
                    $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
                },
                // т.к. нам не нужны все данные по юзеру, то оптимизируем - запрашиваем только _id
                { projection: { _id: 1 } },
            );

            return !!user;
        } catch (error) {
            // не оптимально, но пока не унифицирован подход к обработке ошибок - оставляем
            console.error(
                "Internal DB error in dataCommandRepository -> findByLoginOrEmail:",
                error,
            );

            return false;
        }
    },

    async findNotConfirmedByEmail(email: string): Promise<ObjectId | null> {
        try {
            const user = await usersCollection.findOne<{ _id: ObjectId }>(
                {
                    "emailConfirmation.isConfirmed": false,
                    email: email,
                },
                { projection: { _id: 1 } }, // т.к. нам не нужны все данные по юзеру, то оптимизируем - запрашиваем только _id
            );

            return user ? user._id : null;
        } catch (error) {
            // не оптимально, но пока не унифицирован подход к обработке ошибок - оставляем
            console.error(
                "Internal DB error in dataCommandRepository -> findNotConfirmedByEmail:",
                error,
            );

            return null;
        }
    },

    // *****************************
    // методы для управления черным списком (black list) рефреш токенов (refresh tokens) пользователей
    // *****************************
    async addRefreshTokenInfoToBlackList(
        refreshTokenInfo: RefreshTokenModel,
    ): Promise<boolean> {
        try {
            const result =
                await refreshTokensBlackListCollection.insertOne(
                    refreshTokenInfo,
                );
            return !!result;
        } catch (error) {
            console.error(
                "Unknown error during addRefreshTokenInfoToBlackList",
                error,
            );
            return false;
        }
    },

    async checkIfRefreshTokenInBlackList(
        refreshToken: string,
    ): Promise<boolean> {
        try {
            const result = await refreshTokensBlackListCollection.findOne(
                { refreshToken: refreshToken },
                { projection: { _id: 1 } },
            );
            return !!result;
        } catch (error) {
            console.error(
                "Unknown error during checkIfRefreshTokenInBlackList",
                error,
            );
            return false;
        }
    },

    async findAllUsers(): Promise<UserCollectionStorageModel[]> {
        return usersCollection.find({}).toArray();
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

    async insertUrlCall(
        uslCall: RequestRestrictionStorageModel,
    ): Promise<boolean> {
        try {
            const result =
                await requestsRestrictionDataStorage.insertOne(uslCall);

            return !!result;
        } catch (error) {
            console.error("Unknown error inside insertUrlCall", error);

            return false;
        }
    },

    // *****************************
    // методы для тестов
    // *****************************
    async deleteAllBloggers() {
        await bloggersCollection.deleteMany({});
        await postsCollection.deleteMany({});
        await usersCollection.deleteMany({});
        await commentsCollection.deleteMany({});
        await refreshTokensBlackListCollection.deleteMany({});
        await sessionsDataStorage.deleteMany({});
        await requestsRestrictionDataStorage.deleteMany({});
    },
};
