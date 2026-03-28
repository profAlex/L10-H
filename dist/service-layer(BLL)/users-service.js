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
exports.usersService = void 0;
const command_repository_1 = require("../repository-layers/command-repository-layer/command-repository");
const is_unique_login_email_1 = require("./utility-functions/is-unique-login-email");
const custom_error_class_1 = require("../repository-layers/utility/custom-error-class");
exports.usersService = {
    // getSeveralBlogs, getSeveralPostsById, findSingleBlog переехал в query-repositary-layer, и в потоке который обрабатывает query отсутствует слой service
    // async getSeveralBlogs(sentInputGetBlogsQuery: InputGetBlogsQuery): Promise<{items: WithId<BlogViewModel>[]; totalCount: number}> {
    //
    //     return await dataCommandRepository.getSeveralBlogs(sentInputGetBlogsQuery);
    // },
    createNewUser(newUser) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield (0, is_unique_login_email_1.isUniqueLogin)(newUser.login))) {
                throw new custom_error_class_1.CustomError({
                    errorMessage: { field: 'isUniqueLogin', message: 'login is not unique' }
                });
            }
            if (!(yield (0, is_unique_login_email_1.isUniqueEmail)(newUser.email))) {
                throw new custom_error_class_1.CustomError({
                    errorMessage: { field: 'isUniqueEmail', message: 'email is not unique' }
                });
            }
            return yield command_repository_1.dataCommandRepository.createNewUser(newUser);
        });
    },
    deleteUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield command_repository_1.dataCommandRepository.deleteUser(userId);
        });
    },
};
