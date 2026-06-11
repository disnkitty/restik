CREATE SCHEMA IF NOT EXISTS restaurant;
USE restaurant;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS high_salary_positions;
DROP TABLE IF EXISTS order_details;
DROP TABLE IF EXISTS supply_details;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS supplies;
DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS employee_positions;
DROP TABLE IF EXISTS dishes;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS positions;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS statuses;
DROP TABLE IF EXISTS dish_types;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE Product_categories (
    product_category_id INT AUTO_INCREMENT PRIMARY KEY,
    name_product_category VARCHAR(255) NOT NULL
);

CREATE TABLE Suppliers (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    city VARCHAR(100),
    supplier_email VARCHAR(100),
    supplier_address VARCHAR(255)
);

CREATE TABLE Products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    quantity_grams INT,
    supplier_id INT,
    supplier_price DECIMAL(10, 2),
    product_category_id INT,
    FOREIGN KEY (supplier_id)
        REFERENCES Suppliers(supplier_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    FOREIGN KEY (product_category_id)
        REFERENCES Product_categories(product_category_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE Supplies (
    supply_id INT AUTO_INCREMENT PRIMARY KEY,
    supply_data_time DATETIME NOT NULL,
    total_price DECIMAL(10, 2) DEFAULT 0.00
);

CREATE TABLE Supply_Details (
    supply_id INT,
    product_id INT,
    quantity_grams INT,
    expiration_date DATE,
    PRIMARY KEY (supply_id, product_id),
    FOREIGN KEY (supply_id)
        REFERENCES Supplies(supply_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (product_id)
        REFERENCES Products(product_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE Dish_types (
    dish_type_id INT AUTO_INCREMENT PRIMARY KEY,
    dish_type_name VARCHAR(255) NOT NULL,
    description TEXT
);

CREATE TABLE Dishes (
    dish_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    weight_grams INT,
    price_for_client DECIMAL(10, 2),
    recipe_description TEXT,
    dish_type_id INT,
    preparation_time_minutes INT,
    calories INT,
    FOREIGN KEY (dish_type_id)
        REFERENCES Dish_types(dish_type_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE Recipes (
    dish_id INT,
    product_id INT,
    quantity_grams INT,
    PRIMARY KEY (dish_id, product_id),
    FOREIGN KEY (dish_id)
        REFERENCES Dishes(dish_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (product_id)
        REFERENCES Products(product_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE Positions (
    position_id INT AUTO_INCREMENT PRIMARY KEY,
    position_name VARCHAR(255) NOT NULL,
    salary DECIMAL(10, 2),
    duties_description TEXT,
    work_schedule VARCHAR(255),
    responsibility_level VARCHAR(50)
);

CREATE TABLE Clients (
    client_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    registration_date DATE
);

CREATE TABLE Statuses (
    status_id INT AUTO_INCREMENT PRIMARY KEY,
    status_name VARCHAR(100) NOT NULL
);

CREATE TABLE Employees (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    passport VARCHAR(50),
    phone VARCHAR(20),
    age INT,
    position VARCHAR(100),
    employee_email VARCHAR(100),
    employee_address VARCHAR(255),
    position_id INT,
    hire_date DATE,
    work_experience_years INT,
    FOREIGN KEY (position_id)
        REFERENCES Positions(position_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE Employee_positions (
    employee_id INT,
    position_id INT,
    PRIMARY KEY (employee_id, position_id),
    FOREIGN KEY (employee_id)
        REFERENCES Employees(employee_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (position_id)
        REFERENCES Positions(position_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE Orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    order_date DATETIME,
    client_id INT,
    employee_id INT,
    status_id INT,
    delivery_address VARCHAR(255),
    FOREIGN KEY (client_id)
        REFERENCES Clients(client_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    FOREIGN KEY (employee_id)
        REFERENCES Employees(employee_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    FOREIGN KEY (status_id)
        REFERENCES Statuses(status_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE Order_details (
    order_id INT,
    dish_id INT,
    quantity_of_dishes INT,
    note TEXT,
    PRIMARY KEY (order_id, dish_id),
    FOREIGN KEY (order_id)
        REFERENCES Orders(order_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (dish_id)
        REFERENCES Dishes(dish_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE Transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NULL,
    supply_id INT NULL,
    amount DECIMAL(10, 2),
    transaction_date DATETIME,
    FOREIGN KEY (order_id)
        REFERENCES Orders(order_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    FOREIGN KEY (supply_id)
        REFERENCES Supplies(supply_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE User_Visits (
    ip_address VARCHAR(50) PRIMARY KEY,
    visit_count INT DEFAULT 1,
    last_visit DATETIME
);

INSERT INTO Product_categories (name_product_category) VALUES 
('Овочі'), ('М''ясо'), ('Молочні продукти'), ('Спеції'), ('Борошно');

INSERT INTO Suppliers (full_name, phone, city, supplier_email, supplier_address) VALUES 
('ТОВ Агро', '0501112233', 'Київ', 'agro@test.com', 'вул. Польова 1'),
('М''ясний Двір', '0672223344', 'Львів', 'meat@test.com', 'вул. Лісна 10'),
('Молоко Плюс', '0633334455', 'Дніпро', 'milk@test.com', 'пр. Миру 5'),
('Світ Спецій', '0954445566', 'Одеса', 'spices@test.com', 'вул. Морська 2'),
('Млин Комбінат', '0995556677', 'Харків', 'mlyn@test.com', 'вул. Степова 40');

INSERT INTO Dish_types (dish_type_name, description) VALUES 
('Супи', 'Гарячі перші страви'),
('Салати', 'Свіжі овочеві та змішані'),
('Основні страви', 'М''ясні та рибні страви'),
('Десерти', 'Солодке та випічка'),
('Напої', 'Холодні та гарячі напої');

INSERT INTO Positions (position_name, salary, duties_description, work_schedule, responsibility_level) VALUES 
('Шеф-кухар', 45000, 'Керування кухнею', '2/2', 'Високий'),
('Кухар', 25000, 'Приготування страв', '2/2', 'Середній'),
('Офіціант', 15000, 'Обслуговування клієнтів', '3/3', 'Низький'),
('Адміністратор', 30000, 'Управління залом', '2/2', 'Високий'),
('Кур''єр', 18000, 'Доставка замовлень', 'Гнучкий', 'Низький');

INSERT INTO Statuses (status_name) VALUES 
('Нове'), ('Готується'), ('Доставляється'), ('Виконано'), ('Скасовано');

INSERT INTO Clients (full_name, phone, email, registration_date) VALUES 
('Іван Іванов', '0500000001', 'ivan@test.com', '2023-01-10'),
('Марія Петренко', '0670000002', 'maria@test.com', '2023-02-15'),
('Олег Сидорчук', '0630000003', 'oleg@test.com', '2023-03-20'),
('Ганна Коваль', '0950000004', 'anna@test.com', '2023-04-25'),
('Петро Сорока', '0990000005', 'petro@test.com', '2023-05-30');

INSERT INTO Products (name, quantity_grams, supplier_id, supplier_price, product_category_id) VALUES 
('Картопля', 50000, 1, 15.50, 1), ('Томати', 20000, 1, 60.00, 1), ('Огірки', 15000, 1, 45.00, 1),
('Яловичина', 10000, 2, 250.00, 2), ('Курка', 25000, 2, 120.00, 2), ('Свинина', 15000, 2, 180.00, 2),
('Молоко', 10000, 3, 35.00, 3), ('Сир', 5000, 3, 220.00, 3), ('Вершки', 3000, 3, 90.00, 3),
('Перець', 1000, 4, 300.00, 4), ('Сіль', 10000, 4, 20.00, 4), ('Базилік', 500, 4, 500.00, 4),
('Борошно в/с', 50000, 5, 25.00, 5), ('Цукор', 20000, 5, 30.00, 5), ('Дріжджі', 1000, 5, 150.00, 5);


INSERT INTO Dishes (name, weight_grams, price_for_client, recipe_description, dish_type_id, preparation_time_minutes, calories) VALUES 
('Борщ', 400, 120.00, 'Традиційний борщ', 1, 40, 350),
('Окрошка', 350, 95.00, 'Холодний суп', 1, 20, 200),
('Грибний суп', 300, 110.00, 'Крем-суп', 1, 30, 280),
('Цезар', 250, 180.00, 'Класичний салат', 2, 15, 450),
('Грецький', 200, 140.00, 'Овочевий салат', 2, 10, 210),
('Стейк', 300, 450.00, 'Яловичий стейк', 3, 25, 600),
('Котлета по-київськи', 200, 160.00, 'З маслом', 3, 30, 520),
('Плов', 350, 150.00, 'З яловичиною', 3, 45, 580),
('Паста Ка Carbonara', 300, 190.00, 'Італійська паста', 3, 20, 700),
('Тирамісу', 150, 130.00, 'Кавовий десерт', 4, 15, 380),
('Чізкейк', 150, 145.00, 'Сирний десерт', 4, 10, 420),
('Морозиво', 100, 80.00, 'Вершкове', 4, 5, 250),
('Кава', 200, 50.00, 'Арабіка', 5, 5, 5),
('Чай', 300, 40.00, 'Зелений', 5, 5, 0),
('Лимонад', 400, 65.00, 'Цитрусовий', 5, 10, 120);

INSERT INTO Recipes (dish_id, product_id, quantity_grams) VALUES 
(1, 1, 100), (1, 4, 50), (1, 11, 5), 
(4, 5, 80), (4, 8, 30), 
(6, 4, 300), (6, 10, 5), 
(13, 14, 10), 
(7, 5, 150), (7, 13, 20), 
(11, 8, 100), (11, 14, 30),
(9, 13, 100), (9, 2, 50), (9, 8, 20); 


INSERT INTO Supplies (supply_data_time) VALUES 
('2023-10-01 10:00:00'), ('2023-10-02 11:00:00'), ('2023-10-03 09:00:00'), ('2023-10-04 12:00:00'), ('2023-10-05 08:00:00');

INSERT INTO Supply_Details (supply_id, product_id, quantity_grams, expiration_date) VALUES 
(1, 1, 10000, '2023-12-01'), (2, 4, 5000, '2023-10-15'), (3, 7, 2000, '2023-10-10'), (4, 10, 500, '2024-01-01'), (5, 13, 10000, '2024-03-01');

INSERT INTO Employees (full_name, passport, phone, age, position, employee_email, employee_address, position_id, hire_date, work_experience_years) VALUES 
('Олександр Кухарчук', 'АВ123456', '0671111111', 35, 'Шеф-кухар', 'alex@work.com', 'вул. Головна 1', 1, '2022-01-01', 10),
('Дмитро Смачний', 'АВ223344', '0672222222', 28, 'Кухар', 'dmytro@work.com', 'вул. Бічна 2', 2, '2022-05-01', 5),
('Олена Привітна', 'АВ334455', '0673333333', 22, 'Офіціант', 'olena@work.com', 'вул. Квіткова 3', 3, '2023-01-10', 1),
('Сергій Менеджер', 'АВ445566', '0674444444', 30, 'Адміністратор', 'serg@work.com', 'вул. Центр 4', 4, '2021-12-01', 7),
('Ігор Швидкий', 'АВ556677', '0675555555', 25, 'Кур''єр', 'igor@work.com', 'вул. Дальня 5', 5, '2023-03-01', 2);

INSERT INTO Employee_positions (employee_id, position_id) VALUES 
(1, 1), (2, 2), (3, 3), (4, 4), (5, 5);

INSERT INTO Orders (order_date, client_id, employee_id, status_id, delivery_address) VALUES 
('2023-10-20 14:00:00', 1, 3, 4, 'вул. Польова 1'),
('2023-10-20 15:30:00', 2, 3, 4, 'вул. Лісна 10'),
('2023-10-21 12:00:00', 3, 4, 2, 'пр. Миру 5'),
('2023-10-21 18:00:00', 4, 3, 1, 'вул. Морська 2'),
('2023-10-21 19:00:00', 5, 5, 3, 'вул. Степова 40');

INSERT INTO Order_details (order_id, dish_id, quantity_of_dishes, note) VALUES 
(1, 1, 2, 'Без сметани'), (2, 4, 1, 'Більше соусу'), (3, 6, 1, 'Medium Rare'), (4, 10, 2, 'З собою'), (5, 13, 3, 'Без цукру');

INSERT INTO Transactions (order_id, supply_id, amount, transaction_date) VALUES 
(1, NULL, 240.00, '2023-10-20 14:10:00'),
(NULL, 1, 1550.00, '2023-10-01 10:30:00'),
(2, NULL, 180.00, '2023-10-20 15:40:00'),
(NULL, 2, 1250.00, '2023-10-02 11:30:00'),
(3, NULL, 450.00, '2023-10-21 12:15:00');