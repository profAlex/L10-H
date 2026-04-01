import "reflect-metadata";
import { inject, injectable } from "inversify";

import {UserInputModel} from "../routers/router-types/user-input-model";
import {dataCommandRepository} from "../repository-layers/command-repository-layer/command-repository";
import {isUniqueEmail, isUniqueLogin} from "./utility-functions/is-unique-login-email";
import {CustomError} from "../repository-layers/utility/custom-error-class";
import { UsersCommandRepository } from "../repository-layers/command-repository-layer/users-command-repository";
import { TYPES } from "../composition-root/ioc-types";

@injectable()
export class UsersCommandService {

    constructor(@inject(TYPES.UsersCommandRepository) protected usersCommandRepository:UsersCommandRepository){};

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

        return await this.usersCommandRepository.createNewUser(newUser);
    }

    async deleteUser (userId: string) : Promise<null | undefined> {
        return await this.usersCommandRepository.deleteUser(userId);
    }
}