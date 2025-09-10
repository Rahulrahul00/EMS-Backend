// models/Holiday.js
import { getDB } from "../config/db.js";

export const createHolidayTable = async () => {
  const db = getDB();
  await db.query(
    `
    CREATE TABLE IF NOT EXISTS holidays (
      id INT AUTO_INCREMENT PRIMARY KEY,
      date DATE NOT NULL,
      name VARCHAR(255) NOT NULL,
      type ENUM('Weekend', 'Special_Holiday', 'Other') NOT NULL
    )
    `
  );
  console.log("holidays table ready");
};
