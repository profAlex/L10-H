"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersService = void 0;
const command_repository_1 = require("../repository-layers/command-repository-layer/command-repository");
const is_unique_login_email_1 = require("./utility-functions/is-unique-login-email");
const custom_error_class_1 = require("../repository-layers/utility/custom-error-class");
class usersService {
}
exports.usersService = usersService;
{
    // getSeveralBlogs, getSeveralPostsById, findSingleBlog переехал в query-repositary-layer, и в потоке который обрабатывает query отсутствует слой service
    // async getSeveralBlogs(sentInputGetBlogsQuery: InputGetBlogsQuery): Promise<{items: WithId<BlogViewModel>[]; totalCount: number}> {
    //
    //     return await dataCommandRepository.getSeveralBlogs(sentInputGetBlogsQuery);
    // },
    async;
    createNewUser(newUser, user_input_model_1.UserInputModel);
    Promise < string | undefined > {
        if() { }
    }(await (0, is_unique_login_email_1.isUniqueLogin)(newUser.login));
    {
        throw new custom_error_class_1.CustomError({
            errorMessage: { field: 'isUniqueLogin', message: 'login is not unique' }
        });
    }
    if (!(await (0, is_unique_login_email_1.isUniqueEmail)(newUser.email))) {
        throw new custom_error_class_1.CustomError({
            errorMessage: { field: 'isUniqueEmail', message: 'email is not unique' }
        });
    }
    return await command_repository_1.dataCommandRepository.createNewUser(newUser);
}
async;
deleteUser(userId, string);
Promise < null | undefined > {
    return: await command_repository_1.dataCommandRepository.deleteUser(userId)
},
;
