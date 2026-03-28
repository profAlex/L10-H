"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomError = void 0;
class CustomError extends Error {
    constructor(metaData) {
        super(''); // вызываем конструктор класса родителя (с опциональным сообщением)
        this.metaData = metaData;
        this.name = 'CustomError'; // имя ошибки - по нему в блоке catch можешь отфильтровывать тип ошибки для какой-то кастомной логики обработки ошибки
    }
}
exports.CustomError = CustomError;
