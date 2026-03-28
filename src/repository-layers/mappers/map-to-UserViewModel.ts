import {UserViewModel} from "../../routers/router-types/user-view-model";
import {WithId} from "mongodb";
import {UserCollectionStorageModel} from "../../routers/router-types/user-storage-model";

export const mapSingleUserCollectionToViewModel = (userInContainer: UserCollectionStorageModel) => {
    return {
        id: userInContainer._id.toString(),
        login: userInContainer.login,
        email: userInContainer.email,
        createdAt: userInContainer.createdAt,
    } as UserViewModel;
};