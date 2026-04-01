/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Убеждаемся, что расширение .js тоже обрабатывается ts-jest
  transform: {
    '^.+\\.(t|j)sx?$': [
      'ts-jest',
      {
        // isolatedModules: true,
        useESM: false,
      },
    ],
  },
  // ВАЖНО: Упрощаем паттерн. Говорим Jest:
  // "Игнорируй всё в node_modules, КРОМЕ inversify и @inversifyjs"
  transformIgnorePatterns: [
    "/node_modules/(?!(@inversifyjs|inversify)/)"
  ],
  moduleNameMapper: {
    // Убираем сложные пути, оставляем автоматику
    "^inversify$": "inversify"
  },
};