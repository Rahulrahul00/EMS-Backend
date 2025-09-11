// //Attendance functions
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import {getDB} from '../config/db.js';


// Attendance Marking
export const addAttendance = async (req, res) => {
  const { employee_id, date, status, check_in, check_out } = req.body;

  if (!employee_id || !date || !status) {
    return res
      .status(400)
      .json({ error: "Employee ID, date, and status are required" });
  }
  try {
    const db = getDB();
    //check if employe is exists
    const [employee] = await db.query("SELECT id FROM employees WHERE id = ?", [
      employee_id,
    ]);
    if (employee.length === 0) {
      return res.status(404).json({ error: "Employ not found" });
    }

    //Check if the date is already holiday
    const [holiday] = await db.query("SELECT name FROM holidays WHERE date = ?",[
      date,
    ]);

    if(holiday.length > 0){
     return res.status(400).json({ error:`It's a holiday for ${holiday[0].name}`})
    }

    //check if date is already Leave
    const [leave] = await db.query("SELECT employee_name FROM leave_reports WHERE date = ?", [
      date,
    ]);

    if(leave.length > 0){
      return res.status(400).json({ error: `${leave[0].employee_name} is already on leave`})
    }

    //check if  attendances is already exists
    const [existing] = await db.query(
      "SELECT id FROM attendance WHERE employee_id = ? AND date = ?",
      [employee_id, date]
    );
    if (existing.length > 0) {
      return res
        .status(400)
        .json({ error: "Attendance already marked for this date" });
    }

    const sql = ` INSERT INTO attendance (employee_id, date, status, check_in, check_out)
    VALUES (?, ?, ?, ?, ?)`;

    const [result] = await db.query(sql, [
      employee_id,
      date,
      status,
      status === "present" || status === "late" || status === "half_day"
        ? check_in
        : null,
      status === "present" || status === "half_day" ? check_out : null,
    ]);
    res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to mark attendance", details: error.message });
  }
};

// Get all attendance records
export const getAttandance = async (req, res) => {
  try {
    const db = getDB();
    const [attendance] = await db.query(
      "SELECT a.*, e.name as employee_name FROM attendance a JOIN employees e ON a.employee_id = e.id ORDER BY date DESC"
    );
    res.json(attendance);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to fetch attendance records",
        details: error.message,
      });
  }
};

//Get attendance report by date range
export const getAttandanceReport = async (req, res) => {
  const {startDate, endDate} = req.query;
  try{
    const db = getDB();
    const [attendance] = await db.query(
      `SELECT a.*, e.name as employee_name 
       FROM attendance a 
       JOIN employees e ON a.employee_id = e.id
       WHERE a.date BETWEEN ? AND ?
       ORDER BY a.date ASC`,
      [startDate, endDate]
      
    );
    res.json(attendance)
  }catch(error){
    res.status(500).json({error: "Failed to fetch report", details: error.message});
  }
}


// Employee-wise Attendance Summary
// export const getEmployeeReport = async (req, res) => {
//   const { employeeName, startDate, endDate } = req.query;

//   try {
//     const db = getDB();

//     const [report] = await db.query(
//       `
//       SELECT 
//         e.id,
//         e.name AS employee_name,
//         COUNT(CASE WHEN a.status = 'present' THEN 1 END) AS total_working_days,
//         COUNT(CASE WHEN a.status = 'leave' THEN 1 END) AS total_leaves,
//         ROUND(SUM(
//           CASE 
//             WHEN a.status = 'present' 
//               AND a.check_in IS NOT NULL 
//               AND a.check_out IS NOT NULL 
//             THEN TIME_TO_SEC(TIMEDIFF(a.check_out, a.check_in)) / 3600
//             ELSE 0
//           END
//         ), 1) AS total_working_hours
//       FROM employees e
//       LEFT JOIN attendance a 
//         ON e.id = a.employee_id 
//         AND a.date BETWEEN ? AND ?
//       WHERE e.name LIKE ?
//       GROUP BY e.id, e.name
//       ORDER BY e.name ASC
//       `,
//       [startDate, endDate, `%${employeeName || ''}%`]
//     );

//     res.json(report);
//   } catch (error) {
//     res.status(500).json({
//       error: "Failed to fetch employee report",
//       details: error.message,
//     });
//   }
// };

export const getEmployeeReport = async (req, res) => {
  const { employeeName="", page = 1, pageSize = 5 } = req.query;

  try {
    const db = getDB();

    const offset = (page - 1) * pageSize;

    const [report] = await db.query(
      `
      SELECT 
        e.id AS employee_id,
        e.name AS employee_name,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) AS total_working_days,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) AS total_leaves,
        ROUND(SUM(
          CASE 
            WHEN a.status = 'present' 
              AND a.check_in IS NOT NULL 
              AND a.check_out IS NOT NULL 
            THEN TIME_TO_SEC(TIMEDIFF(a.check_out, a.check_in)) / 3600
            ELSE 0
          END
        ), 1) AS total_working_hours
      FROM employees e
      LEFT JOIN attendance a 
        ON e.id = a.employee_id
      WHERE e.name LIKE ?
      GROUP BY e.id, e.name
      ORDER BY e.name ASC
      LIMIT ? OFFSET ?
      `,
      // [`%${employeeName || ''}%`]
      [`%${employeeName}%`, Number(pageSize), Number(offset)]
    );

    //Get total count (without LIMIT) for pagination
    const [[{ total}]] = await db.query(
       `
      SELECT COUNT(*) AS total
      FROM employees e
      WHERE e.name LIKE ?
      `,
      [`%${employeeName}%`]
    );


  res.json({
    data: report,
    pagination:{
      current: Number(page),
      pageSize: Number(pageSize),
      total,

    },
  });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch employee report",
      details: error.message,
    });
  }
};

export const exportEmployeeReport = async (req, res) =>{
  const {employeeName} =req.query;
  try{
      const db = getDB();

      const [report] = await db.query(
        `
        SELECT 
        e.id,
        e.name AS employee_name,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) AS total_working_days,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) AS total_leaves,
        ROUND(SUM(
          CASE 
            WHEN a.status = 'present' 
              AND a.check_in IS NOT NULL 
              AND a.check_out IS NOT NULL 
            THEN TIME_TO_SEC(TIMEDIFF(a.check_out, a.check_in)) / 3600
            ELSE 0
          END
        ), 1) AS total_working_hours
      FROM employees e
      LEFT JOIN attendance a 
        ON e.id = a.employee_id
      WHERE e.name LIKE ?
      GROUP BY e.id, e.name
      ORDER BY e.name ASC
        `,
        [`%${employeeName || ''}%`]
      );
      
    // formatte total working hours in "Hh Mm" 
    const formatHours = (decimalHours) =>{
      if(!decimalHours) return '0h 0m';
      const hours = Math.floor(decimalHours);
      const minutes = Math.floor((decimalHours - hours) * 60);
      return `${hours}h ${minutes}m`
    }

    const formattedReport = report.map((row,index)=>({
      sl_no : index +1,
      ...row,
      total_working_hours: formatHours(row.total_working_hours),
      
     }));
     
     const exportData = formattedReport.map(({ id, ...rest }) => rest);
     
      //create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      //create work book
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Employee Report');

      //save to buffer instead of file
      const buffer = XLSX.write(workbook, { bookType:'xlsx', type:'buffer' });

      //Send Excel file to client
      res.setHeader(
      "Content-Disposition",
      "attachment; filename=employee_report.xlsx"
      );
      res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.send(buffer);
  }catch(error){
      res.status(500).json({
        error: "Failed to export employee report",
        details: error.message,
      });
  }
}






