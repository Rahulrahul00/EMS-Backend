// Database tables (Attendance)
import { getDB } from "../config/db";

export const createAttendanceTable = async () => {
    const db = getDB();
    await db.query(`
    CREATE TABLE IF NOT EXISTS attendance(
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late', 'half_day') NOT NULL,
    check_in TIME,
    check_out TIME,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (employee_id, date)
    )
    `);
}