"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UUIDgeneration = void 0;
const node_crypto_1 = require("node:crypto");
exports.UUIDgeneration = {
    generateUUID() {
        return (0, node_crypto_1.randomUUID)();
    }
};
