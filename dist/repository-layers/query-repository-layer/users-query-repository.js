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
exports.UsersQueryRepository = void 0;
exports.findUserByPrimaryKey = findUserByPrimaryKey;
const mongodb_1 = require("mongodb");
const mongo_db_1 = require("../../db/mongo.db");
const map_paginated_user_search_1 = require("../mappers/map-paginated-user-search");
const map_to_UserViewModel_1 = require("../mappers/map-to-UserViewModel");
class UsersQueryRepository {
    getSeveralUsers(sentInputGetUsersQuery) {
        return __awaiter(this, void 0, void 0, function* () {
            const { searchLoginTerm, searchEmailTerm, sortBy, sortDirection, pageNumber, pageSize, } = sentInputGetUsersQuery;
            let filter = {};
            const skip = (pageNumber - 1) * pageSize;
            try {
                // добавление первого условия (если было передано)
                if (searchEmailTerm && searchEmailTerm.trim() !== "") {
                    // экранируем спецсимволы для безопасного $regex
                    const escapedSearchTerm = searchEmailTerm
                        .trim()
                        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                    const additionalFilterCondition = {
                        email: { $regex: escapedSearchTerm, $options: "i" },
                    };
                    if (filter.$or) {
                        filter.$or.push(additionalFilterCondition);
                    }
                    else {
                        filter = {
                            $or: [additionalFilterCondition],
                        };
                    }
                }
                // добавление второго условия (если было передано)
                if (searchLoginTerm && searchLoginTerm.trim() !== "") {
                    const escapedSearchTerm = searchLoginTerm
                        .trim()
                        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                    const additionalFilterCondition = {
                        login: { $regex: escapedSearchTerm, $options: "i" },
                    };
                    if (filter.$or) {
                        filter.$or.push(additionalFilterCondition);
                    }
                    else {
                        filter = {
                            $or: [additionalFilterCondition],
                        };
                    }
                }
            }
            catch (err) {
                console.error("Error while processing and adding filtering conditions inside dataQueryRepository.getSeveralUsers: ", err);
                throw new Error("Error while processing and adding filtering conditions inside dataQueryRepository.getSeveralUsers");
            }
            if (!sortBy) {
                console.error("Error: sortBy is null or undefined inside dataQueryRepository.getSeveralUsers");
                throw new Error("Error: sortBy is null or undefined inside dataQueryRepository.getSeveralUsers");
            }
            const items = yield mongo_db_1.usersCollection
                .find(filter)
                // "asc" (по возрастанию), то используется 1
                // "desc" — то -1 для сортировки по убыванию. - по алфавиту от Я-А, Z-A
                .sort({ [sortBy]: sortDirection })
                // пропускаем определённое количество документов перед тем, как вернуть нужный набор данных.
                .skip(skip)
                // ограничивает количество возвращаемых документов до значения pageSize
                .limit(pageSize)
                .toArray();
            const totalCount = yield mongo_db_1.usersCollection.countDocuments(filter);
            return (0, map_paginated_user_search_1.mapToUsersListPaginatedOutput)(items, {
                pageNumber: pageNumber,
                pageSize: pageSize,
                totalCount,
            });
        });
    }
    findSingleUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (mongodb_1.ObjectId.isValid(userId)) {
                const user = yield findUserByPrimaryKey(new mongodb_1.ObjectId(userId));
                if (user) {
                    return (0, map_to_UserViewModel_1.mapSingleUserCollectionToViewModel)(user);
                }
            }
            return undefined;
        });
    }
    findByLoginOrEmail(loginOrEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield mongo_db_1.usersCollection.findOne({
                    $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
                });
                return result;
            }
            catch (error) {
                console.error("Error finding user by login or email:", error);
                return null;
            }
        });
    }
    returnUsersAmount() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield mongo_db_1.usersCollection.countDocuments();
        });
    }
}
exports.UsersQueryRepository = UsersQueryRepository;
// перенести? сделать методом класса? написать для других классов свои варианты?
function findUserByPrimaryKey(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return mongo_db_1.usersCollection.findOne({ _id: id });
    });
}
