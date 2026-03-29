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
exports.dataQueryRepository = void 0;
const mongo_db_1 = require("../../db/mongo.db");
const mongodb_1 = require("mongodb");
const map_to_BlogViewModel_1 = require("../mappers/map-to-BlogViewModel");
const map_to_PostViewModel_1 = require("../mappers/map-to-PostViewModel");
const map_paginated_blog_search_1 = require("../mappers/map-paginated-blog-search");
const map_paginated_post_search_1 = require("../mappers/map-paginated-post-search");
const map_to_UserMeViewModel_1 = require("../mappers/map-to-UserMeViewModel");
const map_paginated_comment_search_1 = require("../mappers/map-paginated-comment-search");
const map_to_CommentViewModel_1 = require("../mappers/map-to-CommentViewModel");
const mapSessionStorageToDeviceViewModel_1 = require("../mappers/mapSessionStorageToDeviceViewModel");
const users_query_repository_1 = require("./users-query-repository");
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
// async function findUserByPrimaryKey(
//     id: ObjectId,
// ): Promise<UserCollectionStorageModel | null> {
//     return usersCollection.findOne({ _id: id });
// }
function findCommentByPrimaryKey(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return mongo_db_1.commentsCollection.findOne({ _id: id });
    });
}
exports.dataQueryRepository = {
    getSeveralCommentsByPostId(sentPostId, sentSanitizedQuery) {
        return __awaiter(this, void 0, void 0, function* () {
            const { sortBy, sortDirection, pageNumber, pageSize } = sentSanitizedQuery;
            const skip = (pageNumber - 1) * pageSize;
            const items = yield mongo_db_1.commentsCollection
                .find({ relatedPostId: sentPostId })
                // "asc" (по возрастанию), то используется 1
                // "desc" — то -1 для сортировки по убыванию. - по алфавиту от Я-А, Z-A
                .sort({ [sortBy]: sortDirection })
                // пропускаем определённое количество док. перед тем, как вернуть нужный набор данных.
                .skip(skip)
                // ограничивает количество возвращаемых документов до значения pageSize
                .limit(pageSize)
                .toArray();
            const totalCount = yield mongo_db_1.commentsCollection.countDocuments({
                relatedPostId: sentPostId,
            });
            return (0, map_paginated_comment_search_1.mapToCommentListPaginatedOutput)(items, {
                pageNumber: pageNumber,
                pageSize: pageSize,
                totalCount,
            });
        });
    },
    findSingleComment(commentId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (mongodb_1.ObjectId.isValid(commentId)) {
                const comment = yield findCommentByPrimaryKey(new mongodb_1.ObjectId(commentId));
                if (comment) {
                    return (0, map_to_CommentViewModel_1.mapSingleCommentToViewModel)(comment);
                }
            }
            return undefined;
        });
    },
    // *****************************
    // методы для управления блогами
    // *****************************
    getSeveralBlogs(sentInputGetBlogsQuery) {
        return __awaiter(this, void 0, void 0, function* () {
            const { searchNameTerm, sortBy, sortDirection, pageNumber, pageSize } = sentInputGetBlogsQuery;
            let filter = {};
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
            }
            catch (err) {
                console.error("Error while processing and adding filtering conditions inside dataQueryRepository.getSeveralBlogs: ", err);
                throw new Error("Error while processing and adding filtering conditions inside dataQueryRepository.getSeveralBlogs");
            }
            if (!sortBy) {
                console.error("Error: sortBy is null or undefined inside dataQueryRepository.getSeveralBlogs");
                throw new Error("Error: sortBy is null or undefined inside dataQueryRepository.getSeveralBlogs");
            }
            const items = yield mongo_db_1.bloggersCollection
                .find(filter)
                // "asc" (по возрастанию), то используется 1
                // "desc" — то -1 для сортировки по убыванию. - по алфавиту от Я-А, Z-A
                .sort({ [sortBy]: sortDirection })
                // пропускаем определённое количество документов перед тем, как вернуть нужный набор данных.
                .skip(skip)
                // ограничивает количество возвращаемых документов до значения pageSize
                .limit(pageSize)
                .toArray();
            const totalCount = yield mongo_db_1.bloggersCollection.countDocuments(filter);
            return (0, map_paginated_blog_search_1.mapToBlogListPaginatedOutput)(items, {
                pageNumber: pageNumber,
                pageSize: pageSize,
                totalCount,
            });
        });
    },
    getSeveralPostsById(sentBlogId, sentSanitizedQuery) {
        return __awaiter(this, void 0, void 0, function* () {
            const { sortBy, sortDirection, pageNumber, pageSize } = sentSanitizedQuery;
            const skip = (pageNumber - 1) * pageSize;
            if (!sortBy) {
                console.error("Error: sortBy is null or undefined inside dataQueryRepository.getSeveralPostsById");
                throw new Error("Error: sortBy is null or undefined inside dataQueryRepository.getSeveralPostsById");
            }
            const items = yield mongo_db_1.postsCollection
                .find({ blogId: sentBlogId })
                // "asc" (по возрастанию), то используется 1
                // "desc" — то -1 для сортировки по убыванию. - по алфавиту от Я-А, Z-A
                .sort({ [sortBy]: sortDirection })
                // пропускаем определённое количество док. перед тем, как вернуть нужный набор данных.
                .skip(skip)
                // ограничивает количество возвращаемых документов до значения pageSize
                .limit(pageSize)
                .toArray();
            const totalCount = yield mongo_db_1.postsCollection.countDocuments({
                blogId: sentBlogId,
            });
            return (0, map_paginated_post_search_1.mapToPostListPaginatedOutput)(items, {
                pageNumber: pageNumber,
                pageSize: pageSize,
                totalCount,
            });
        });
    },
    findSingleBlog(blogId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (mongodb_1.ObjectId.isValid(blogId)) {
                const blogger = yield findBlogByPrimaryKey(new mongodb_1.ObjectId(blogId));
                if (blogger) {
                    return (0, map_to_BlogViewModel_1.mapSingleBloggerCollectionToViewModel)(blogger);
                }
            }
            return undefined;
        });
    },
    // *****************************
    // методы для управления постами
    // *****************************
    getSeveralPosts(sentSanitizedQuery) {
        return __awaiter(this, void 0, void 0, function* () {
            const { sortBy, sortDirection, pageNumber, pageSize } = sentSanitizedQuery;
            const skip = (pageNumber - 1) * pageSize;
            if (!sortBy) {
                console.error("ERROR: sortBy is null or undefined inside dataQueryRepository.getSeveralPosts");
                throw new Error("Error: sortBy is null or undefined inside dataQueryRepository.getSeveralPosts");
            }
            const items = yield mongo_db_1.postsCollection
                .find({})
                // "asc" (по возрастанию), то используется 1
                // "desc" — то -1 для сортировки по убыванию. - по алфавиту от Я-А, Z-A
                .sort({ [sortBy]: sortDirection })
                // пропускаем определённое количество док. перед тем, как вернуть нужный набор данных.
                .skip(skip)
                // ограничивает количество возвращаемых документов до значения pageSize
                .limit(pageSize)
                .toArray();
            const totalCount = yield mongo_db_1.postsCollection.countDocuments({});
            return (0, map_paginated_post_search_1.mapToPostListPaginatedOutput)(items, {
                pageNumber: pageNumber,
                pageSize: pageSize,
                totalCount,
            });
        });
    },
    findSinglePost(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (mongodb_1.ObjectId.isValid(postId)) {
                const post = yield findPostByPrimaryKey(new mongodb_1.ObjectId(postId));
                if (post) {
                    return (0, map_to_PostViewModel_1.mapSinglePostCollectionToViewModel)(post);
                }
            }
            return undefined;
        });
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
    findUserForMe(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (mongodb_1.ObjectId.isValid(userId)) {
                const user = yield (0, users_query_repository_1.findUserByPrimaryKey)(new mongodb_1.ObjectId(userId));
                if (user) {
                    return (0, map_to_UserMeViewModel_1.mapSingleUserCollectionToMeViewModel)(user);
                }
            }
            return undefined;
        });
    },
    // *****************************
    // методы для security-devices
    // *****************************
    utilGetAllSessionRecords() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield mongo_db_1.sessionsDataStorage.find({}).toArray();
        });
    },
    getActiveDevicesList(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentDate = new Date();
            const activeSessions = yield mongo_db_1.sessionsDataStorage
                .find({
                userId: userId,
                expiresAt: { $gt: currentDate },
            }, {
                projection: {
                    deviceIp: 1,
                    deviceName: 1,
                    issuedAt: 1,
                    deviceId: 1,
                },
            })
                .toArray();
            if (activeSessions.length > 0) {
                return (0, mapSessionStorageToDeviceViewModel_1.mapSessionStorageToDeviceViewModel)(activeSessions);
            }
            return [];
        });
    },
    calculateIfCallAllowed(url, deviceIp, deviceName, timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            // Определяем временную границу: сейчас минус 10 секунд
            const tenSecondsAgo = new Date(Date.now() - timeout * 1000);
            try {
                // Подсчитываем количество записей, соответствующих условиям:
                // - calledURL совпадает с переданным URL
                // - deviceIp совпадает с переданным IP
                // - deviceName совпадает с переданным именем устройства
                // - dateOfRequest >= tenSecondsAgo (за последние 10 секунд)
                const count = yield mongo_db_1.requestsRestrictionDataStorage.countDocuments({
                    calledURL: url,
                    deviceIp: deviceIp,
                    deviceName: deviceName,
                    dateOfRequest: { $gte: tenSecondsAgo },
                });
                // Возвращаем true, если количество запросов <= 5 (вызов разрешён),
                // false — если >= 5 (вызов запрещён)
                return count < 5;
            }
            catch (error) {
                console.error("Error while checking request restrictions:", error);
                // В случае ошибки считаем, что вызов запрещён (fail‑safe)
                return false;
            }
        });
    },
    utilGetAllRestrictedSessionRecords() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield mongo_db_1.requestsRestrictionDataStorage.find({}).toArray();
        });
    },
    // *****************************
    // методы для тестов
    // *****************************
    returnBloggersAmount() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield mongo_db_1.bloggersCollection.countDocuments();
        });
    },
    // async returnUsersAmount() {
    //     return await usersCollection.countDocuments();
    // },
};
