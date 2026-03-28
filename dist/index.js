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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startApp = void 0;
const setup_app_1 = require("./setup-app");
const mongo_db_1 = require("./db/mongo.db");
const config_1 = require("./config");
const router_pathes_1 = require("./routers/pathes/router-pathes");
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
(0, setup_app_1.setupApp)(app);
app.set('trust proxy', true); // для получения корректного ip-адреса из req.ip необходимо вызвать
const PORT = config_1.envConfig.appPort;
const startApp = () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, mongo_db_1.runDB)();
    app.listen(PORT, () => {
        console.log(`Server started on port ${PORT}`);
    });
});
exports.startApp = startApp;
(0, exports.startApp)();
process.on('SIGINT', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('\nReceived SIGINT (Ctrl+C). Shutting down gracefully...');
    app.delete(`${router_pathes_1.TESTING_PATH}/all-data`, (req, res) => {
        res.status(200).send("All good!");
    });
    yield (0, mongo_db_1.closeDB)();
    process.exit(0);
}));
process.on('SIGTERM', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Received SIGTERM. Shutting down gracefully...');
    app.delete(`${router_pathes_1.TESTING_PATH}/all-data`, (req, res) => {
        res.status(200).send("All good!");
    });
    yield (0, mongo_db_1.closeDB)();
    process.exit(0);
}));
module.exports = app;
