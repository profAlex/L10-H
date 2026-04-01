"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapToUsersListPaginatedOutput = mapToUsersListPaginatedOutput;
function mapToUsersListPaginatedOutput(users, metaData) {
    return {
        pagesCount: Math.ceil(metaData.totalCount / metaData.pageSize),
        page: metaData.pageNumber,
        pageSize: metaData.pageSize,
        totalCount: metaData.totalCount,
        items: users.map((user) => ({
            id: user._id.toString(),
            login: user.login,
            email: user.email,
            createdAt: user.createdAt,
        })),
    };
}
