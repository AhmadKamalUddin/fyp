CREATE DATABASE ai;
SHOW DATABASES;
USE ai;
CREATE USER 'appuser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'qwerty';
GRANT ALL PRIVILEGES ON ai.* TO 'appuser'@'localhost';
FLUSH PRIVILEGES;
SHOW GRANTS FOR 'appuser'@'localhost';


