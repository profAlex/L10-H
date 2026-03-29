import { InputGetUsersQuery } from "../routers/router-types/user-search-input-model";
import { PaginatedUserViewModel } from "../routers/router-types/user-paginated-view-model";
import { UsersQueryRepository } from "../repository-layers/query-repository-layer/users-query-repository";
import { UserViewModel } from "../routers/router-types/user-view-model";

export class UsersQueryService{
    constructor (protected usersQueryRepository:UsersQueryRepository){};

    async getSeveralUsers(
        sentInputGetUsersQuery: InputGetUsersQuery
    ): Promise<PaginatedUserViewModel> {
        return await this.usersQueryRepository.getSeveralUsers(sentInputGetUsersQuery);
    }

    async findSingleUser(userId: string): Promise<UserViewModel | undefined> {
        return await this.usersQueryRepository.findSingleUser(userId);
    }

}