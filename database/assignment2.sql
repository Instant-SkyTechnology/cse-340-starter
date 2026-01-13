/* -------------------------------
   TASK 1 QUERIES 
--------------------------------*/

/* Task 1.1: Insert Tony Stark */
INSERT INTO account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n')
ON CONFLICT (account_email) DO NOTHING;

/* Task 1.2: Update Tony Stark to Admin */
UPDATE account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';

/* Task 1.3: Delete Tony Stark */
DELETE FROM account
WHERE account_email = 'tony@starkent.com';

/* Task 1.4: Update GM Hummer description */
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

/* Task 1.5: Select Sport vehicles */
SELECT i.inv_make, i.inv_model, c.classification_name
FROM inventory i
INNER JOIN classification c
  ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

/* Task 1.6: Update image paths */
UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');


/* -------------------------------
   DATABASE REBUILD SECTION
--------------------------------*/

/* Drop tables if they exist (safe for rebuild) */
DROP TABLE IF EXISTS account CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS classification CASCADE;

/* Create tables */
CREATE TABLE account (
    account_id SERIAL PRIMARY KEY,
    account_firstname VARCHAR(50) NOT NULL,
    account_lastname VARCHAR(50) NOT NULL,
    account_email VARCHAR(100) NOT NULL UNIQUE,
    account_password VARCHAR(100) NOT NULL,
    account_type VARCHAR(20) DEFAULT 'Customer'
);

CREATE TABLE classification (
    classification_id SERIAL PRIMARY KEY,
    classification_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE inventory (
    inv_id SERIAL PRIMARY KEY,
    inv_make VARCHAR(50) NOT NULL,
    inv_model VARCHAR(50) NOT NULL,
    inv_description TEXT,
    inv_image VARCHAR(255),
    inv_thumbnail VARCHAR(255),
    classification_id INT REFERENCES classification(classification_id)
);

/* Insert sample data */
INSERT INTO classification (classification_name) VALUES
('Sport'), ('SUV'), ('Truck')
ON CONFLICT DO NOTHING;

INSERT INTO inventory (inv_make, inv_model, inv_description, inv_image, inv_thumbnail, classification_id) VALUES
('GM', 'Hummer', 'small interiors', '/images/hummer.jpg', '/images/hummer_thumb.jpg', 
    (SELECT classification_id FROM classification WHERE classification_name = 'SUV')),
('Ford', 'Mustang', 'fast sports car', '/images/mustang.jpg', '/images/mustang_thumb.jpg', 
    (SELECT classification_id FROM classification WHERE classification_name = 'Sport')),
('Chevrolet', 'Camaro', 'sleek sports car', '/images/camaro.jpg', '/images/camaro_thumb.jpg', 
    (SELECT classification_id FROM classification WHERE classification_name = 'Sport'))
ON CONFLICT DO NOTHING;

/* -------------------------------
   TASK 1 QUERIES TO END REBUILD
--------------------------------*/

/* Task 1.4: Update GM Hummer description */
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

/* Task 1.6: Update image paths */
UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');



