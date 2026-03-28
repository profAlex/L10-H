import {
    BLOGGERS_COLLECTION_NAME,
    bloggersCollection,
    COMMENTS_COLLECTION_NAME,
    commentsCollection,
    POSTS_COLLECTION_NAME,
    postsCollection,
    USERS_COLLECTION_NAME,
    usersCollection,
} from "./mongo.db";

export enum CollectionNames {
    Posts = POSTS_COLLECTION_NAME, // "postsCollection"
    Blogs = BLOGGERS_COLLECTION_NAME, // "bloggersCollection"
    Users = USERS_COLLECTION_NAME, // "usersCollection"
    Comments = COMMENTS_COLLECTION_NAME, // "commentsCollection"
}

export type Collections = {
    [CollectionNames.Posts]: typeof postsCollection;
    [CollectionNames.Blogs]: typeof bloggersCollection;
    [CollectionNames.Users]: typeof usersCollection;
    [CollectionNames.Comments]: typeof commentsCollection;
};
