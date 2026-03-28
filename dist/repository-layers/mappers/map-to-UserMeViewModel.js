"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapSingleUserCollectionToMeViewModel = void 0;
const mapSingleUserCollectionToMeViewModel = (userInContainer) => {
    return {
        email: userInContainer.email,
        login: userInContainer.login,
        userId: userInContainer._id.toString(),
    };
};
exports.mapSingleUserCollectionToMeViewModel = mapSingleUserCollectionToMeViewModel;
