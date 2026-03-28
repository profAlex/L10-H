"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapSingleUserCollectionToViewModel = void 0;
const mapSingleUserCollectionToViewModel = (userInContainer) => {
    return {
        id: userInContainer._id.toString(),
        login: userInContainer.login,
        email: userInContainer.email,
        createdAt: userInContainer.createdAt,
    };
};
exports.mapSingleUserCollectionToViewModel = mapSingleUserCollectionToViewModel;
