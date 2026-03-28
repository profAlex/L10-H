import {UserViewModel} from "../../routers/router-types/user-view-model";
import {WithId} from "mongodb";
import {PaginatedUserViewModel} from "../../routers/router-types/user-paginated-view-model";
import {UserCollectionStorageModel} from "../../routers/router-types/user-storage-model";

export function mapToUsersListPaginatedOutput(
    users: WithId<UserCollectionStorageModel>[],
    metaData: { pageNumber: number; pageSize: number; totalCount: number },
): PaginatedUserViewModel {
    return {
        pagesCount: Math.ceil(metaData.totalCount / metaData.pageSize),
        page: metaData.pageNumber,
        pageSize: metaData.pageSize,
        totalCount: metaData.totalCount,

        items: users.map(
            (user): UserViewModel => ({
                id: user._id.toString(),
                login: user.login,
                email: user.email,
                createdAt: user.createdAt,
            }),
        ),
    };
}