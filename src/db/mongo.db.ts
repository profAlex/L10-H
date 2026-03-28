import { Collection, Db, IndexDescriptionInfo, MongoClient } from "mongodb";
import { BlogViewModel } from "../routers/router-types/blog-view-model";
import { PostViewModel } from "../routers/router-types/post-view-model";
import { UserCollectionStorageModel } from "../routers/router-types/user-storage-model";
import { CommentStorageModel } from "../routers/router-types/comment-storage-model";
import { RefreshTokensStorageModel } from "../routers/router-types/refresh-tokens-storage-model";
import { SessionStorageModel } from "../routers/router-types/auth-SessionStorageModel";
import { RequestRestrictionStorageModel } from "../routers/router-types/auth-RequestRestrictionStorageModel";
import { envConfig } from "../config";

const DB_NAME = "bloggers_db";
export const BLOGGERS_COLLECTION_NAME = "bloggers_collection";
export const POSTS_COLLECTION_NAME = "posts_collection";
export const USERS_COLLECTION_NAME = "users_collection";
export const COMMENTS_COLLECTION_NAME = "comments_collection";
export const REFRESH_TOKENS_COLLECTION_NAME = "refresh_tokens_collection";

export const SESSIONS_COLLECTION_NAME = "sessions_collection";
export const REQUESTS_RESTRICTIONS_COLLECTION_NAME = "requests_restrictions_collection";

const URI =
    "mongodb+srv://admin:admin@learningcluster.f1zm90x.mongodb.net/?retryWrites=true&w=majority&appName=LearningCluster";

let db: Db | null = null;

export let client: MongoClient | null = null;

export let bloggersCollection: Collection<BlogViewModel>;
export let postsCollection: Collection<PostViewModel>;
export let usersCollection: Collection<UserCollectionStorageModel>;
export let commentsCollection: Collection<CommentStorageModel>;
export let refreshTokensBlackListCollection: Collection<RefreshTokensStorageModel>;

export let sessionsDataStorage: Collection<SessionStorageModel>;
export let requestsRestrictionDataStorage: Collection<RequestRestrictionStorageModel>;

export async function runDB() {
    // console.log('⏱️ runDB() called at:', new Date().toISOString());
    // const stack = new Error().stack;
    // console.log('Call stack:', stack);

    client = new MongoClient(URI);
    db = client.db(DB_NAME);

    bloggersCollection = db.collection<BlogViewModel>(BLOGGERS_COLLECTION_NAME);
    postsCollection = db.collection<PostViewModel>(POSTS_COLLECTION_NAME);
    usersCollection = db.collection<UserCollectionStorageModel>(
        USERS_COLLECTION_NAME,
    );
    commentsCollection = db.collection<CommentStorageModel>(
        COMMENTS_COLLECTION_NAME,
    );
    refreshTokensBlackListCollection = db.collection<RefreshTokensStorageModel>(
        REFRESH_TOKENS_COLLECTION_NAME,
    );

    // настройка автоудаления токенов
    await refreshTokensBlackListCollection.createIndex(
        { createdAt: 1 }, // поле для индексации
        {
            // unique: true,  // это лишнее, не ускоряет поиск по индексированному полю, это просто встроенная провекра на уникальность, для нашего случая помоему излишне
            expireAfterSeconds: 86400, // считается в секундах, т.е. 24×60×60 = 86400 это будут одни сутки, а, например, 604 800 сек = 7 суток
        },
    );



    // настройка автоудаления сессий
    sessionsDataStorage = db.collection<SessionStorageModel>(SESSIONS_COLLECTION_NAME);

    // const existingIndexes = await sessionsDataStorage.indexes();
    // const existingIndex = existingIndexes.find(idx => idx.name === "createdAt");
    //
    // if (!existingIndex) {
    //     // Создаём индекс, если его нет
    //     await sessionsDataStorage.createIndex(
    //         { createdAt: 1 },
    //         { name: "createdAt", expireAfterSeconds: 25 }
    //     );
    // } else if (existingIndex.expireAfterSeconds !== 25) {
    //     // Удаляем старый и создаём новый, если TTL не совпадает
    //     await sessionsDataStorage.dropIndex("createdAt");
    //     await sessionsDataStorage.createIndex(
    //         { createdAt: 1 },
    //         { name: "createdAt", expireAfterSeconds: 25 }
    //     )
    // }
    // const indexes = await sessionsDataStorage.indexes();
    // const indexExists = indexes.some(idx => idx.name === 'createdAt');
    //
    // if (indexExists) {
    //     await sessionsDataStorage.dropIndex('createdAt');
    // } else {
    //     console.log('Index "createdAt" not found — skipping drop.');
    // }

    // try {
    //     await sessionsDataStorage.dropIndex('createdAt_1');
    // } catch (error) {
    //     console.log( error); // Перебрасываем ошибку, если это не «индекс не найден»
    // }
    //
    // try {
    //     await sessionsDataStorage.dropIndex('createdAt');
    // } catch (error) {
    //     console.log( error); // Перебрасываем ошибку, если это не «индекс не найден»
    // }
    //
    // await sessionsDataStorage.createIndex(
    //     { createdAt: 1 }, // поле для индексации
    //     {
    //         expireAfterSeconds: 25, // считается в секундах, например: 24×60×60 = 86400 это будут одни сутки, а, например, 604 800 сек = 7 суток
    //     },
    // );


    // try {
    //     await sessionsDataStorage.dropIndex('dateOfRequest_1');
    // } catch (error) {
    //     console.log( error); // Перебрасываем ошибку, если это не «индекс не найден»
    // }
    //
    // try {
    //     await sessionsDataStorage.dropIndex('dateOfRequest');
    // } catch (error) {
    //     console.log( error); // Перебрасываем ошибку, если это не «индекс не найден»
    // }

    requestsRestrictionDataStorage = db.collection<RequestRestrictionStorageModel>(REQUESTS_RESTRICTIONS_COLLECTION_NAME);
    // await requestsRestrictionDataStorage.createIndex(
    //     { dateOfRequest: 1 }, // поле для индексации
    //     {
    //         expireAfterSeconds: 15, // считается в секундах, например: 24×60×60 = 86400 это будут одни сутки, а, например, 604 800 сек = 7 суток
    //     },
    // );

    // Для sessions — только свой индекс
    await setupCollectionIndexes(
        sessionsDataStorage,
        'sessions',
        [
            {
                field: 'createdAt',
                name: 'createdAt_1',
                ttl: envConfig.refreshTokenLifetime+5,
                description: 'TTL index for sessions (25s)'
            }
        ]
    );

// Для requests_restrictions — только свой индекс
    await setupCollectionIndexes(
        requestsRestrictionDataStorage,
        'requests_restrictions',
        [
            {
                field: 'dateOfRequest',
                name: 'dateOfRequest_1',
                ttl: 30,
                description: 'TTL index for requests_restrictions (15s)'
            }
        ]
    );
    
    try {
        await client.connect();
        await db.command({ ping: 1 });
        console.log(`🟢 Connected to DB ${DB_NAME}`);
    } catch (error) {
        await client.close();
        throw new Error(`Database not connected: ${error}`);
    }
}

export async function closeDB() {
    try {
        if (client) {
            await client.close();

            console.log("🛑 MongoDB connection closed");
            client = null;
            db = null;
        }
    } catch (error) {
        console.error("Error: ", error);
    }
}


async function setupCollectionIndexes(
    collection: Collection<SessionStorageModel> | Collection<RequestRestrictionStorageModel>,
    collectionName: string,
    indexesToSetup: Array<{
        field: string;
        name: string;
        ttl: number;
        description: string;
    }>
): Promise<void> {
    // Фильтруем индексы: берём только те, что принадлежат этой коллекции
    const relevantIndexes = indexesToSetup.filter(index => {
        if (collectionName === 'sessions') {
            return index.name === 'createdAt_1';
        } else if (collectionName === 'requests_restrictions') {
            return index.name === 'dateOfRequest_1';
        }
        return false;
    });

    for (const indexConfig of relevantIndexes) {
        try {
            const existingIndexes = await collection.indexes();
            const existingIndex = existingIndexes.find(idx => idx.name === indexConfig.name);

            if (!existingIndex) {
                console.log(`Creating index ${indexConfig.name} for ${collectionName}`);
                await collection.createIndex(
                    { [indexConfig.field]: 1 },
                    {
                        name: indexConfig.name,
                        expireAfterSeconds: indexConfig.ttl
                    }
                );
                console.log(`✓ Index ${indexConfig.name} created successfully`);
            } else if (existingIndex.expireAfterSeconds !== indexConfig.ttl) {
                console.log(
                    `Updating index ${indexConfig.name}: TTL ${existingIndex.expireAfterSeconds} → ${indexConfig.ttl}`
                );
                await collection.dropIndex(indexConfig.name);
                await collection.createIndex(
                    { [indexConfig.field]: 1 },
                    {
                        name: indexConfig.name,
                        expireAfterSeconds: indexConfig.ttl
                    }
                );
                console.log(`✓ Index ${indexConfig.name} updated successfully`);
            } else {
                console.log(
                    `ℹ️ Index ${indexConfig.name} already exists with correct TTL (${indexConfig.ttl}s)`
                );
            }
        } catch (error) {
            console.error(
                `❌ Error processing index ${indexConfig.name}:`,
                error
            );
            throw error;
        }
    }
}


export { db };
