Цей проєкт має фронтенд (React + TypeScript) у папці `client` та бекенд (Node) у папці `server`. Щоб запустити і переглянути програму на комп'ютері, потрібно просто встановити Node. js і, якщо потрібно, базу даних, а потім виконати кілька команд.

Рекомендований план дій (якщо Windows)

1. Витягніть ZIP файл у будь-яку папку та відкрийте його у VS Code.
2. Відкрийте два термінали (або дві вкладки):
   - Сервер:  
     ```
     cd server
     npm install
     npm run dev   # або `npm start`, якщо немає dev
     ```
     Сервер зазвичай працює на порту `3001`. У консолі ви побачите повідомлення на кшталт `Server is running on port 3001`.
   - Клієнт:  
     ```
     cd client
     npm install
     npm start
     ```
     Клієнт зазвичай запускається на `http://localhost:3000`.

3. Відкрийте у браузері `http://localhost:3000` і перевірте, як виглядає інтерфейс.

База даних — як підключити і наповнити

    mysql -u <user> -p <db_name> < server\db\schema.sql
    mysql -u <user> -p <db_name> < server\db\seed.sql
    ```
-або
  ```
  cd server
  npm run seed
  ```
