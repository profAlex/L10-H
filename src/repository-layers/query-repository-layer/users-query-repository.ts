import { PaginatedUserViewModel } from "../../routers/router-types/user-paginated-view-model";
import { InputGetUsersQuery } from "../../routers/router-types/user-search-input-model";
import { ObjectId, WithId } from "mongodb";
import { UserCollectionStorageModel } from "../../routers/router-types/user-storage-model";
import { usersCollection } from "../../db/mongo.db";
import { mapToUsersListPaginatedOutput } from "../mappers/map-paginated-user-search";
import { UserViewModel } from "../../routers/router-types/user-view-model";
import { mapSingleUserCollectionToViewModel } from "../mappers/map-to-UserViewModel";

export class UsersQueryRepository {
    static async getSeveralUsers(
        sentInputGetUsersQuery: InputGetUsersQuery,
    ): Promise<PaginatedUserViewModel> {
        const {
            searchLoginTerm,
            searchEmailTerm,
            sortBy,
            sortDirection,
            pageNumber,
            pageSize,
        } = sentInputGetUsersQuery;

        let filter: any = {};
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
                } else {
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
                } else {
                    filter = {
                        $or: [additionalFilterCondition],
                    };
                }
            }
        } catch (err) {
            console.error(
                "Error while processing and adding filtering conditions inside dataQueryRepository.getSeveralUsers: ",
                err,
            );
            throw new Error(
                "Error while processing and adding filtering conditions inside dataQueryRepository.getSeveralUsers",
            );
        }

        if (!sortBy) {
            console.error(
                "Error: sortBy is null or undefined inside dataQueryRepository.getSeveralUsers",
            );
            throw new Error(
                "Error: sortBy is null or undefined inside dataQueryRepository.getSeveralUsers",
            );
        }

        const items: WithId<UserCollectionStorageModel>[] =
            await usersCollection
                .find(filter)

                // "asc" (по возрастанию), то используется 1
                // "desc" — то -1 для сортировки по убыванию. - по алфавиту от Я-А, Z-A
                .sort({ [sortBy]: sortDirection })

                // пропускаем определённое количество документов перед тем, как вернуть нужный набор данных.
                .skip(skip)

                // ограничивает количество возвращаемых документов до значения pageSize
                .limit(pageSize)
                .toArray();

        const totalCount = await usersCollection.countDocuments(filter);

        return mapToUsersListPaginatedOutput(items, {
            pageNumber: pageNumber,
            pageSize: pageSize,
            totalCount,
        });
    }

    static async findSingleUser(userId: string): Promise<UserViewModel | undefined> {
        if (ObjectId.isValid(userId)) {
            const user = await findUserByPrimaryKey(new ObjectId(userId));

            if (user) {
                return mapSingleUserCollectionToViewModel(user);
            }
        }

        return undefined;
    }

    static async findByLoginOrEmail(
        loginOrEmail: string,
    ): Promise<WithId<UserCollectionStorageModel> | null> {
        try {
            const result = await usersCollection.findOne({
                $or: [{ email: loginOrEmail }, { login: loginOrEmail }],
            });

            return result;
        } catch (error) {
            console.error("Error finding user by login or email:", error);
            return null;
        }
    }

    async returnUsersAmount() {
        return await usersCollection.countDocuments();
    }


}


// перенести? сделать методом класса? написать для других классов свои варианты?
export async function findUserByPrimaryKey(
    id: ObjectId,
): Promise<UserCollectionStorageModel | null> {
    return usersCollection.findOne({ _id: id });
}
