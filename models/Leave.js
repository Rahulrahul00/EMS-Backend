    import { getDB } from "../config/db.js";

    export const createLeaveTable = async () => {
    const db = getDB();
    await db.query(`
        CREATE TABLE IF NOT EXISTS leave_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        employee_name VARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        leave_type ENUM('sick', 'casual','personal') NOT NULL,
        status ENUM('paid', 'unpaid') NOT NULL,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
    `);
    };

