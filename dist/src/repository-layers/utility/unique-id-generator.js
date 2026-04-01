"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCombinedId = void 0;
// пока не используем
const generateCombinedId = () => {
    const timestamp = Date.now();
    const random = Math.random().toString().substring(2, 5);
    return `${timestamp}-${random}`;
};
exports.generateCombinedId = generateCombinedId;
