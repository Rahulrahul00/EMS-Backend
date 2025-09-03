//Database tables (User)
import { getDB } from "../config/db.js";

export const createUserTable = async () =>{
    const db = getDB();
    await db.query(`
        CREATE TABLE IF NOT EXISTS users(
         id INT AUTO_INCREMENT PRIMARY KEY,
         name VARCHAR(255) NOT NULL,
         email VARCHAR(255) UNIQUE NOT NULL,
         password VARCHAR(255) NOT NULL,
         role ENUM('admin', 'employee') DEFAULT 'employee',
         is_verified BOOLEAN DEFAULT FALSE,
         verification_token VARCHAR(255),
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) 
        `);
};