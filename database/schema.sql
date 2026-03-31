CREATE DATABASE IF NOT EXISTS smart_city_services;
USE smart_city_services;

CREATE TABLE Users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('Customer', 'Worker', 'Admin') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Workers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category ENUM('Electrician', 'Plumber', 'Painter', 'Construction Worker', 'Maintenance Worker') NOT NULL,
  experience INT NOT NULL,
  location VARCHAR(255) NOT NULL,
  verification_status ENUM('Pending', 'Verified', 'Rejected') DEFAULT 'Pending',
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_name VARCHAR(255) NOT NULL
);

CREATE TABLE Bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  worker_id INT NOT NULL,
  service_id INT NOT NULL,
  description TEXT,
  booking_date DATETIME NOT NULL,
  status ENUM('Pending', 'Accepted', 'Completed') DEFAULT 'Pending',
  FOREIGN KEY (customer_id) REFERENCES Customers(id) ON DELETE CASCADE,
  FOREIGN KEY (worker_id) REFERENCES Workers(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES Services(id) ON DELETE SET NULL
);

CREATE TABLE Ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  review TEXT,
  FOREIGN KEY (booking_id) REFERENCES Bookings(id) ON DELETE CASCADE
);
