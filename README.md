# Тестовое задание для "Такие Дела", Удальцов Кирилл

Я решил сделать запуск WordPress и MySQL внутри Docker контейнеров, так же для удобства добавил контейнер с PhpMyAdmin. Данные для подключения к БД должны быть указаны в .env файле в директории wordpress.

Для фронтенда используется index.html и вся директория static.

## CSS

Для эксперимента я делал import css-файлов, которые немного разделены в modules. Для цветов я использовал переменные CSS. SVG исполюзовал инлайново. Старался по необходимости использовать БЭМ.

## JavaScript

Javascript код разделен на логические секции: переменные, элементы, данные, функции, действия и эвенты. Для запросов использовал Fetch API.

### WordPress

В самом WordPress в файле functions.php реализовал два кастомных роута, возвращающих категории и посты в нужном для фронтенда формате.
