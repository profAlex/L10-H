import { PaginatedBlogViewModel } from "../../routers/router-types/blog-paginated-view-model";
import { InputGetBlogsQuery } from "../../routers/router-types/blog-search-input-model";
import {
    bloggersCollection,
    commentsCollection,
    postsCollection,
    requestsRestrictionDataStorage,
    sessionsDataStorage,
    usersCollection,
} from "../../db/mongo.db";
import { InputGetBlogPostsByIdQuery } from "../../routers/router-types/blog-search-by-id-input-model";
import { ObjectId, WithId } from "mongodb";
import { PostViewModel } from "../../routers/router-types/post-view-model";
import { PaginatedPostViewModel } from "../../routers/router-types/post-paginated-view-model";
import { BlogViewModel } from "../../routers/router-types/blog-view-model";
import {
    BloggerCollectionStorageModel,
    PostCollectionStorageModel,
} from "../command-repository-layer/command-repository";
import { mapSingleBloggerCollectionToViewModel } from "../mappers/map-to-BlogViewModel";
import { mapSinglePostCollectionToViewModel } from "../mappers/map-to-PostViewModel";
import { PaginatedUserViewModel } from "../../routers/router-types/user-paginated-view-model";
import { InputGetUsersQuery } from "../../routers/router-types/user-search-input-model";
import { mapToBlogListPaginatedOutput } from "../mappers/map-paginated-blog-search";
import { mapToPostListPaginatedOutput } from "../mappers/map-paginated-post-search";
import { UserViewModel } from "../../routers/router-types/user-view-model";
import { mapToUsersListPaginatedOutput } from "../mappers/map-paginated-user-search";
import { mapSingleUserCollectionToViewModel } from "../mappers/map-to-UserViewModel";
import { UserCollectionStorageModel } from "../../routers/router-types/user-storage-model";
import { UserMeViewModel } from "../../routers/router-types/user-me-view-model";
import { mapSingleUserCollectionToMeViewModel } from "../mappers/map-to-UserMeViewModel";
import { InputGetPostsQuery } from "../../routers/router-types/post-search-input-model";
import { PaginatedCommentViewModel } from "../../routers/router-types/comment-paginated-view-model";
import { mapToCommentListPaginatedOutput } from "../mappers/map-paginated-comment-search";
import { InputGetCommentsQueryModel } from "../../routers/router-types/comment-search-input-query-model";
import { CommentViewModel } from "../../routers/router-types/comment-view-model";
import { CommentStorageModel } from "../../routers/router-types/comment-storage-model";
import { mapSingleCommentToViewModel } from "../mappers/map-to-CommentViewModel";
import { DeviceViewModel } from "../../routers/router-types/security-devices-device-view-model";
import { mapSessionStorageToDeviceViewModel } from "../mappers/mapSessionStorageToDeviceViewModel";
import { SessionStorageModel } from "../../routers/router-types/auth-SessionStorageModel";
import { RequestRestrictionStorageModel } from "../../routers/router-types/auth-RequestRestrictionStorageModel";
import { findUserByPrimaryKey } from "./users-query-repository";

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

// async function findUserByPrimaryKey(
//     id: ObjectId,
// ): Promise<UserCollectionStorageModel | null> {
//     return usersCollection.findOne({ _id: id });
// }

async function findCommentByPrimaryKey(
    id: ObjectId,
): Promise<CommentStorageModel | null> {
    return commentsCollection.findOne({ _id: id });
}

export const dataQueryRepository = {
    async getSeveralCommentsByPostId(
        sentPostId: string,
        sentSanitizedQuery: InputGetCommentsQueryModel,
    ): Promise<PaginatedCommentViewModel> {
        const { sortBy, sortDirection, pageNumber, pageSize } =
            sentSanitizedQuery;

        const skip = (pageNumber - 1) * pageSize;

        const items = await commentsCollection
            .find({ relatedPostId: sentPostId })

            // "asc" (по возрастанию), то используется 1
            // "desc" — то -1 для сортировки по убыванию. - по алфавиту от Я-А, Z-A
            .sort({ [sortBy]: sortDirection })

            // пропускаем определённое количество док. перед тем, как вернуть нужный набор данных.
            .skip(skip)

            // ограничивает количество возвращаемых документов до значения pageSize
            .limit(pageSize)
            .toArray();

        const totalCount = await commentsCollection.countDocuments({
            relatedPostId: sentPostId,
        });

        return mapToCommentListPaginatedOutput(items, {
            pageNumber: pageNumber,
            pageSize: pageSize,
            totalCount,
        });
    },

    async findSingleComment(
        commentId: string,
    ): Promise<CommentViewModel | undefined> {
        if (ObjectId.isValid(commentId)) {
            const comment = await findCommentByPrimaryKey(
                new ObjectId(commentId),
            );

            if (comment) {
                return mapSingleCommentToViewModel(comment);
            }
        }

        return undefined;
    },
    // *****************************
    // методы для управления блогами
    // *****************************
    async getSeveralBlogs(
        sentInputGetBlogsQuery: InputGetBlogsQuery,
    ): Promise<PaginatedBlogViewModel> {
        const { searchNameTerm, sortBy, sortDirection, pageNumber, pageSize } =
            sentInputGetBlogsQuery;

        let filter: any = {};
        const skip = (pageNumber - 1) * pageSize;

        try {
            if (searchNameTerm && searchNameTerm.trim() !== "") {
                // Экранируем спецсимволы для безопасного $regex
                const escapedSearchTerm = searchNameTerm
                    .trim()
                    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

                filter = {
                    $or: [
                        { name: { $regex: escapedSearchTerm, $options: "i" } },
                        {
                            description: {
                                $regex: escapedSearchTerm,
                                $options: "i",
                            },
                        },
                        {
                            websiteUrl: {
                                $regex: escapedSearchTerm,
                                $options: "i",
                            },
                        },
                    ],
                };
            }
        } catch (err) {
            console.error(
                "Error while processing and adding filtering conditions inside dataQueryRepository.getSeveralBlogs: ",
                err,
            );
            throw new Error(
                "Error while processing and adding filtering conditions inside dataQueryRepository.getSeveralBlogs",
            );
        }

        if (!sortBy) {
            console.error(
                "Error: sortBy is null or undefined inside dataQueryRepository.getSeveralBlogs",
            );
            throw new Error(
                "Error: sortBy is null or undefined inside dataQueryRepository.getSeveralBlogs",
            );
        }

        const items = await bloggersCollection
            .find(filter)

            // "asc" (по возрастанию), то используется 1
            // "desc" — то -1 для сортировки по убыванию. - по алфавиту от Я-А, Z-A
            .sort({ [sortBy]: sortDirection })

            // пропускаем определённое количество документов перед тем, как вернуть нужный набор данных.
            .skip(skip)

            // ограничивает количество возвращаемых документов до значения pageSize
            .limit(pageSize)
            .toArray();

        const totalCount = await bloggersCollection.countDocuments(filter);

        return mapToBlogListPaginatedOutput(items, {
            pageNumber: pageNumber,
            pageSize: pageSize,
            totalCount,
        });
    },

    async getSeveralPostsById(
        sentBlogId: string,
        sentSanitizedQuery: InputGetBlogPostsByIdQuery,
    ): Promise<PaginatedPostViewModel> {
        const { sortBy, sortDirection, pageNumber, pageSize } =
            sentSanitizedQuery;

        const skip = (pageNumber - 1) * pageSize;

        if (!sortBy) {
            console.error(
                "Error: sortBy is null or undefined inside dataQueryRepository.getSeveralPostsById",
            );
            throw new Error(
                "Error: sortBy is null or undefined inside dataQueryRepository.getSeveralPostsById",
            );
        }

        const items = await postsCollection
            .find({ blogId: sentBlogId })

            // "asc" (по возрастанию), то используется 1
            // "desc" — то -1 для сортировки по убыванию. - по алфавиту от Я-А, Z-A
            .sort({ [sortBy]: sortDirection })

            // пропускаем определённое количество док. перед тем, как вернуть нужный набор данных.
            .skip(skip)

            // ограничивает количество возвращаемых документов до значения pageSize
            .limit(pageSize)
            .toArray();

        const totalCount = await postsCollection.countDocuments({
            blogId: sentBlogId,
        });

        return mapToPostListPaginatedOutput(items, {
            pageNumber: pageNumber,
            pageSize: pageSize,
            totalCount,
        });
    },

    async findSingleBlog(blogId: string): Promise<BlogViewModel | undefined> {
        if (ObjectId.isValid(blogId)) {
            const blogger: BloggerCollectionStorageModel | null =
                await findBlogByPrimaryKey(new ObjectId(blogId));

            if (blogger) {
                return mapSingleBloggerCollectionToViewModel(blogger);
            }
        }

        return undefined;
    },

    // *****************************
    // методы для управления постами
    // *****************************

    async getSeveralPosts(
        sentSanitizedQuery: InputGetBlogPostsByIdQuery,
    ): Promise<PaginatedPostViewModel> {
        const { sortBy, sortDirection, pageNumber, pageSize } =
            sentSanitizedQuery;

        const skip = (pageNumber - 1) * pageSize;

        if (!sortBy) {
            console.error(
                "ERROR: sortBy is null or undefined inside dataQueryRepository.getSeveralPosts",
            );
            throw new Error(
                "Error: sortBy is null or undefined inside dataQueryRepository.getSeveralPosts",
            );
        }

        const items = await postsCollection
            .find({})

            // "asc" (по возрастанию), то используется 1
            // "desc" — то -1 для сортировки по убыванию. - по алфавиту от Я-А, Z-A
            .sort({ [sortBy]: sortDirection })

            // пропускаем определённое количество док. перед тем, как вернуть нужный набор данных.
            .skip(skip)

            // ограничивает количество возвращаемых документов до значения pageSize
            .limit(pageSize)
            .toArray();

        const totalCount = await postsCollection.countDocuments({});

        return mapToPostListPaginatedOutput(items, {
            pageNumber: pageNumber,
            pageSize: pageSize,
            totalCount,
        });
    },

    async findSinglePost(postId: string): Promise<PostViewModel | undefined> {
        if (ObjectId.isValid(postId)) {
            const post: PostCollectionStorageModel | null =
                await findPostByPrimaryKey(new ObjectId(postId));

            if (post) {
                return mapSinglePostCollectionToViewModel(post);
            }
        }

        return undefined;
    },

    // *****************************
    // методы для управления юзерами
    // *****************************

    // async getSeveralUsers(
    //     sentInputGetUsersQuery: InputGetUsersQuery,
    // ): Promise<PaginatedUserViewModel> {
    //     const {
    //         searchLoginTerm,
    //         searchEmailTerm,
    //         sortBy,
    //         sortDirection,
    //         pageNumber,
    //         pageSize,
    //     } = sentInputGetUsersQuery;
    //
    //     let filter: any = {};
    //     const skip = (pageNumber - 1) * pageSize;
    //
    //     try {
    //         // добавление первого условия (если было передано)
    //         if (searchEmailTerm && searchEmailTerm.trim() !== "") {
    //             // экранируем спецсимволы для безопасного $regex
    //             const escapedSearchTerm = searchEmailTerm
    //                 .trim()
    //                 .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    //
    //             const additionalFilterCondition = {
    //                 email: { $regex: escapedSearchTerm, $options: "i" },
    //             };
    //
    //             if (filter.$or) {
    //                 filter.$or.push(additionalFilterCondition);
    //             } else {
    //                 filter = {
    //                     $or: [additionalFilterCondition],
    //                 };
    //             }
    //         }
    //
    //         // добавление второго условия (если было передано)
    //         if (searchLoginTerm && searchLoginTerm.trim() !== "") {
    //             const escapedSearchTerm = searchLoginTerm
    //                 .trim()
    //                 .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    //
    //             const additionalFilterCondition = {
    //                 login: { $regex: escapedSearchTerm, $options: "i" },
    //             };
    //
    //             if (filter.$or) {
    //                 filter.$or.push(additionalFilterCondition);
    //             } else {
    //                 filter = {
    //                     $or: [additionalFilterCondition],
    //                 };
    //             }
    //         }
    //     } catch (err) {
    //         console.error(
    //             "Error while processing and adding filtering conditions inside dataQueryRepository.getSeveralUsers: ",
    //             err,
    //         );
    //         throw new Error(
    //             "Error while processing and adding filtering conditions inside dataQueryRepository.getSeveralUsers",
    //         );
    //     }
    //
    //     if (!sortBy) {
    //         console.error(
    //             "Error: sortBy is null or undefined inside dataQueryRepository.getSeveralUsers",
    //         );
    //         throw new Error(
    //             "Error: sortBy is null or undefined inside dataQueryRepository.getSeveralUsers",
    //         );
    //     }
    //
    //     const items: WithId<UserCollectionStorageModel>[] =
    //         await usersCollection
    //             .find(filter)
    //
    //             // "asc" (по возрастанию), то используется 1
    //             // "desc" — то -1 для сортировки по убыванию. - по алфавиту от Я-А, Z-A
    //             .sort({ [sortBy]: sortDirection })
    //
    //             // пропускаем определённое количество документов перед тем, как вернуть нужный набор данных.
    //             .skip(skip)
    //
    //             // ограничивает количество возвращаемых документов до значения pageSize
    //             .limit(pageSize)
    //             .toArray();
    //
    //     const totalCount = await usersCollection.countDocuments(filter);
    //
    //     return mapToUsersListPaginatedOutput(items, {
    //         pageNumber: pageNumber,
    //         pageSize: pageSize,
    //         totalCount,
    //     });
    // },
    //
    // async findSingleUser(userId: string): Promise<UserViewModel | undefined> {
    //     if (ObjectId.isValid(userId)) {
    //         const user = await findUserByPrimaryKey(new ObjectId(userId));
    //
    //         if (user) {
    //             return mapSingleUserCollectionToViewModel(user);
    //         }
    //     }
    //
    //     return undefined;
    // },
    //
    // async findByLoginOrEmail(
    //     loginOrEmail: string,
    // ): Promise<WithId<UserCollectionStorageModel> | null> {
    //     try {
    //         const result = await usersCollection.findOne({
    //             $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
    //         });
    //
    //         return result;
    //     } catch (error) {
    //         console.error('Error finding user by login or email:', error);
    //         return null;
    //     }
    // },

    // *****************************
    // методы для auth
    // *****************************

    // ЭТО НАДО ПЕРЕНЕСТИ В UsersQueryRepository, а точнее переделать чтобы использовать оттуда как-то, это работа с юзерами
    async findUserForMe(userId: string): Promise<UserMeViewModel | undefined> {
        if (ObjectId.isValid(userId)) {
            const user = await findUserByPrimaryKey(new ObjectId(userId));

            if (user) {
                return mapSingleUserCollectionToMeViewModel(user);
            }
        }

        return undefined;
    },

    // *****************************
    // методы для security-devices
    // *****************************
    async utilGetAllSessionRecords():Promise<Array<SessionStorageModel>> {
        return await sessionsDataStorage.find({}).toArray();
    },

    async getActiveDevicesList(
        userId: string,
    ): Promise<Array<DeviceViewModel>> {
        const currentDate = new Date();
        const activeSessions = await sessionsDataStorage
            .find(
                {
                    userId: userId,
                    expiresAt: { $gt: currentDate },
                },
                {
                    projection: {
                        deviceIp: 1,
                        deviceName: 1,
                        issuedAt: 1,
                        deviceId: 1,
                    },
                },
            )
            .toArray();

        if (activeSessions.length > 0) {
            return mapSessionStorageToDeviceViewModel(activeSessions);
        }

        return [];
    },

    async calculateIfCallAllowed(
        url: string,
        deviceIp: string,
        deviceName: string,
        timeout: number
    ): Promise<boolean> {
        // Определяем временную границу: сейчас минус 10 секунд
        const tenSecondsAgo = new Date(Date.now() - timeout * 1000);

        try {
            // Подсчитываем количество записей, соответствующих условиям:
            // - calledURL совпадает с переданным URL
            // - deviceIp совпадает с переданным IP
            // - deviceName совпадает с переданным именем устройства
            // - dateOfRequest >= tenSecondsAgo (за последние 10 секунд)
            const count = await requestsRestrictionDataStorage.countDocuments({
                calledURL: url,
                deviceIp: deviceIp,
                deviceName: deviceName,
                dateOfRequest: { $gte: tenSecondsAgo },
            });

            // Возвращаем true, если количество запросов <= 5 (вызов разрешён),
            // false — если >= 5 (вызов запрещён)
            return count < 5;
        } catch (error) {
            console.error("Error while checking request restrictions:", error);
            // В случае ошибки считаем, что вызов запрещён (fail‑safe)
            return false;
        }
    },

    async utilGetAllRestrictedSessionRecords():Promise<Array<RequestRestrictionStorageModel>> {
        return await requestsRestrictionDataStorage.find({}).toArray();
    },

    // *****************************
    // методы для тестов
    // *****************************
    async returnBloggersAmount() {
        return await bloggersCollection.countDocuments();
    },

    // async returnUsersAmount() {
    //     return await usersCollection.countDocuments();
    // },
};
