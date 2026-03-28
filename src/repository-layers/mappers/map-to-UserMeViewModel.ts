import { UserCollectionStorageModel } from "../../routers/router-types/user-storage-model";
import { UserMeViewModel } from "../../routers/router-types/user-me-view-model";

export const mapSingleUserCollectionToMeViewModel = (
    userInContainer: UserCollectionStorageModel,
) => {
    return {
        email: userInContainer.email,
        login: userInContainer.login,
        userId: userInContainer._id.toString(),
    } as UserMeViewModel;
};
