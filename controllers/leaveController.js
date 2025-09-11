import {getDB} from '../config/db.js';

//Create a leave report
export const createLeaveReport = async (req, res) =>{
    const db = getDB();
    try {
        const {employee_id, employee_name, date, leave_type, status, reason} = req.body;

        //check existing same date and id
        const [existing] = await db.query(
          "SELECT * FROM leave_reports WHERE date = ? AND employee_id = ?",
          [date, employee_id]
        );
        if(existing.length > 0){
          return res.status(400).json({error:"Leave already applied for this date"})
        }
        const [result] = await db.query(
            "INSERT INTO leave_reports (employee_id, employee_name, date, leave_type, status, reason) VALUES (?, ?, ?, ?, ?, ?)",
            [employee_id, employee_name, date, leave_type, status, reason]
        );
        res.status(201).json({id: result.insertId, employee_id, employee_name, date, leave_type, status, reason});
    } catch (error) {
        res.status(500).json({message: 'Error creating leave report', error: error.message})
    }
};

//Get all leave report
export const getLeaveReports = async (req, res) =>{
    const db = getDB();
    try{
        const [rows] = await db.query("SELECT * FROM leave_reports ORDER BY id DESC");
        res.json(rows);
    }catch(error){
        res.status(500).json({message: "Error fetching leave report", error: error.message})
    }
}

//update Leave Report
export const updateLeaveReport = async (req, res) => {
    const db = getDB();
  try {
    const { id } = req.params;
    const { employee_id, employee_name, date, leave_type, status, reason } = req.body;

    await db.query(
      "UPDATE leave_reports SET employee_id=?, employee_name=?, date=?, leave_type=?, status=?, reason=? WHERE id=?",
      [employee_id, employee_name, date, leave_type, status, reason, id]
    );

    res.json({ message: "Leave report updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error updating leave report", error: err.message });
  }
};

//Delete leave report
export const deleteLeaveReport = async (req, res) => {
    const db = getDB();
  try {
    const { id } = req.params;
    await db.query("DELETE FROM leave_reports WHERE id=?", [id]);
    res.json({ message: "Leave report deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting leave report", error: err.message });
  }
};
