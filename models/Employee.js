//Database tables (Employee)

// models/Employee.js
import { getDB } from "../config/db.js";

export const createEmployeeTable = async () => {
  const db = getDB();
  await db.query(`
    CREATE TABLE IF NOT EXISTS employees(
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      department VARCHAR(100),
      role ENUM('employee', 'admin') DEFAULT 'employee',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};
