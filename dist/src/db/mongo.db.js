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
exports.db = exports.requestsRestrictionDataStorage = exports.sessionsDataStorage = exports.refreshTokensBlackListCollection = exports.commentsCollection = exports.usersCollection = exports.postsCollection = exports.bloggersCollection = exports.client = exports.REQUESTS_RESTRICTIONS_COLLECTION_NAME = exports.SESSIONS_COLLECTION_NAME = exports.REFRESH_TOKENS_COLLECTION_NAME = exports.COMMENTS_COLLECTION_NAME = exports.USERS_COLLECTION_NAME = exports.POSTS_COLLECTION_NAME = exports.BLOGGERS_COLLECTION_NAME = void 0;
exports.runDB = runDB;
exports.closeDB = closeDB;
const mongodb_1 = require("mongodb");
const config_1 = require("../config");
const DB_NAME = "bloggers_db";
exports.BLOGGERS_COLLECTION_NAME = "bloggers_collection";
exports.POSTS_COLLECTION_NAME = "posts_collection";
exports.USERS_COLLECTION_NAME = "users_collection";
exports.COMMENTS_COLLECTION_NAME = "comments_collection";
exports.REFRESH_TOKENS_COLLECTION_NAME = "refresh_tokens_collection";
exports.SESSIONS_COLLECTION_NAME = "sessions_collection";
exports.REQUESTS_RESTRICTIONS_COLLECTION_NAME = "requests_restrictions_collection";
const URI = "mongodb+srv://admin:admin@learningcluster.f1zm90x.mongodb.net/?retryWrites=true&w=majority&appName=LearningCluster";
let db = null;
exports.db = db;
exports.client = null;
function runDB() {
    return __awaiter(this, void 0, void 0, function* () {
        // console.log('⏱️ runDB() called at:', new Date().toISOString());
        // const stack = new Error().stack;
        // console.log('Call stack:', stack);
        exports.client = new mongodb_1.MongoClient(URI);
        exports.db = db = exports.client.db(DB_NAME);
        exports.bloggersCollection = db.collection(exports.BLOGGERS_COLLECTION_NAME);
        exports.postsCollection = db.collection(exports.POSTS_COLLECTION_NAME);
        exports.usersCollection = db.collection(exports.USERS_COLLECTION_NAME);
        exports.commentsCollection = db.collection(exports.COMMENTS_COLLECTION_NAME);
        exports.refreshTokensBlackListCollection = db.collection(exports.REFRESH_TOKENS_COLLECTION_NAME);
        // настройка автоудаления токенов
        yield exports.refreshTokensBlackListCollection.createIndex({ createdAt: 1 }, // поле для индексации
        {
            // unique: true,  // это лишнее, не ускоряет поиск по индексированному полю, это просто встроенная провекра на уникальность, для нашего случая помоему излишне
            expireAfterSeconds: 86400, // считается в секундах, т.е. 24×60×60 = 86400 это будут одни сутки, а, например, 604 800 сек = 7 суток
        });
        // настройка автоудаления сессий
        exports.sessionsDataStorage = db.collection(exports.SESSIONS_COLLECTION_NAME);
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
        exports.requestsRestrictionDataStorage = db.collection(exports.REQUESTS_RESTRICTIONS_COLLECTION_NAME);
        // await requestsRestrictionDataStorage.createIndex(
        //     { dateOfRequest: 1 }, // поле для индексации
        //     {
        //         expireAfterSeconds: 15, // считается в секундах, например: 24×60×60 = 86400 это будут одни сутки, а, например, 604 800 сек = 7 суток
        //     },
        // );
        // Для sessions — только свой индекс
        yield setupCollectionIndexes(exports.sessionsDataStorage, 'sessions', [
            {
                field: 'createdAt',
                name: 'createdAt_1',
                ttl: config_1.envConfig.refreshTokenLifetime + 5,
                description: 'TTL index for sessions (25s)'
            }
        ]);
        // Для requests_restrictions — только свой индекс
        yield setupCollectionIndexes(exports.requestsRestrictionDataStorage, 'requests_restrictions', [
            {
                field: 'dateOfRequest',
                name: 'dateOfRequest_1',
                ttl: 30,
                description: 'TTL index for requests_restrictions (15s)'
            }
        ]);
        try {
            yield exports.client.connect();
            yield db.command({ ping: 1 });
            console.log(`🟢 Connected to DB ${DB_NAME}`);
        }
        catch (error) {
            yield exports.client.close();
            throw new Error(`Database not connected: ${error}`);
        }
    });
}
function closeDB() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (exports.client) {
                yield exports.client.close();
                console.log("🛑 MongoDB connection closed");
                exports.client = null;
                exports.db = db = null;
            }
        }
        catch (error) {
            console.error("Error: ", error);
        }
    });
}
function setupCollectionIndexes(collection, collectionName, indexesToSetup) {
    return __awaiter(this, void 0, void 0, function* () {
        // Фильтруем индексы: берём только те, что принадлежат этой коллекции
        const relevantIndexes = indexesToSetup.filter(index => {
            if (collectionName === 'sessions') {
                return index.name === 'createdAt_1';
            }
            else if (collectionName === 'requests_restrictions') {
                return index.name === 'dateOfRequest_1';
            }
            return false;
        });
        for (const indexConfig of relevantIndexes) {
            try {
                const existingIndexes = yield collection.indexes();
                const existingIndex = existingIndexes.find(idx => idx.name === indexConfig.name);
                if (!existingIndex) {
                    console.log(`Creating index ${indexConfig.name} for ${collectionName}`);
                    yield collection.createIndex({ [indexConfig.field]: 1 }, {
                        name: indexConfig.name,
                        expireAfterSeconds: indexConfig.ttl
                    });
                    console.log(`✓ Index ${indexConfig.name} created successfully`);
                }
                else if (existingIndex.expireAfterSeconds !== indexConfig.ttl) {
                    console.log(`Updating index ${indexConfig.name}: TTL ${existingIndex.expireAfterSeconds} → ${indexConfig.ttl}`);
                    yield collection.dropIndex(indexConfig.name);
                    yield collection.createIndex({ [indexConfig.field]: 1 }, {
                        name: indexConfig.name,
                        expireAfterSeconds: indexConfig.ttl
                    });
                    console.log(`✓ Index ${indexConfig.name} updated successfully`);
                }
                else {
                    console.log(`ℹ️ Index ${indexConfig.name} already exists with correct TTL (${indexConfig.ttl}s)`);
                }
            }
            catch (error) {
                console.error(`❌ Error processing index ${indexConfig.name}:`, error);
                throw error;
            }
        }
    });
}
