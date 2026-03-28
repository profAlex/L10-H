export class CustomError extends Error {
    constructor(
        public metaData: {
            errorMessage: { field: string; message: string }
        }
    ) {
        super(''); // вызываем конструктор класса родителя (с опциональным сообщением)
        this.name = 'CustomError'; // имя ошибки - по нему в блоке catch можешь отфильтровывать тип ошибки для какой-то кастомной логики обработки ошибки
    }
}