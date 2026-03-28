import {UserInputModel} from "../routers/router-types/user-input-model";
import {dataCommandRepository} from "../repository-layers/command-repository-layer/command-repository";
import {isUniqueEmail, isUniqueLogin} from "./utility-functions/is-unique-login-email";
import {CustomError} from "../repository-layers/utility/custom-error-class";

export const usersService = {
    // getSeveralBlogs, getSeveralPostsById, findSingleBlog переехал в query-repositary-layer, и в потоке который обрабатывает query отсутствует слой service

    // async getSeveralBlogs(sentInputGetBlogsQuery: InputGetBlogsQuery): Promise<{items: WithId<BlogViewModel>[]; totalCount: number}> {
    //
    //     return await dataCommandRepository.getSeveralBlogs(sentInputGetBlogsQuery);
    // },

    async createNewUser(newUser: UserInputModel): Promise<string | undefined> {

        if(!(await isUniqueLogin(newUser.login))){
            throw new CustomError({
                errorMessage: { field: 'isUniqueLogin', message: 'login is not unique' }
            });
        }

        if(!(await isUniqueEmail(newUser.email))){
            throw new CustomError({
                errorMessage: { field: 'isUniqueEmail', message: 'email is not unique' }
            });
        }

        return await dataCommandRepository.createNewUser(newUser);
    },

    async deleteUser (userId: string) : Promise<null | undefined> {
        return await dataCommandRepository.deleteUser(userId);
    },
}