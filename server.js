import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MySQL
let db;

const connectDB = async () => {
  try {
    db = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "company", //data base name
    });
    console.log("connected to MySQL Database");

   await createAttendanceTable();
  } catch (error) {
    console.log("MySQL connection failed:", error.message);
    process.exit(1); // stop server if DB fails
  }
};
// Attendance Section
const createAttendanceTable = async () =>{
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
};



//Get all Employess
app.get("/api/employees", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM employees");
    res.json(rows);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch employees", details: error.message });
  }
});

// Add New employee
app.post("/api/employees", async (req, res) => {
  const { name, email, designation, department } = req.body;

  if (!name || !email || !designation || !department) {
    return res.status(400).json({success:false, error: "All fields are required" });
  }

  try {
    //check if email already exists
    const [existing] = await db.query("SELECT id FROM employees WHERE email = ?", [email]);
    if(existing.length > 0){
      return res.status(400).json({ success: false, error:'Email already exists', field: 'email'});
    }
    const sql =
      "INSERT INTO employees (name, email, designation, department) VALUES (?, ?, ?, ?)";
    const [result] = await db.query(sql, [
      name,
      email,
      designation,
      department,
    ]);


    // Return the new employee object
    const newEmployee = {
      id: result.insertId,
      name,
      email,
      designation,
      department,
    };

    // res.json({ message: "Employee added", employee: newEmployee });
      res.status(201).json({ success:true, message: "Employee added successfully", employee: newEmployee });
  } catch (error) {
    res.status(500).json({ success:false,
      error: "Failed to add employee",
      details: error.message,
    });
  }
});

// PUT Update employee
app.put("/api/employees/:id", async (req, res) => {
  const id = req.params.id;
  const { name, email, designation, department } = req.body;
  if (!name || !email || !designation || !department) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    const sql = "UPDATE employees SET name=?, email=?, designation=?, department=? WHERE id=?";
    const [result] = await db.query(sql, [name, email, designation, department, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }
    // Fetch the updated employee
    const [rows] = await db.query("SELECT * FROM employees WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Employee not found after update" });
    }
    res.json({ message: "Employee updated successfully", employee: rows[0] });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Failed to update employee", details: error.message });
  }
});


// Delete employee
app.delete("/api/employees/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid employee ID" });
  }

  const sql = "DELETE FROM employees WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Delete error:", err);
      return res.status(500).json({ error: "Failed to delete employee" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.status(200).json({ message: "Employee deleted successfully", id });
  });
});


// Attendance Marking
app.post('/api/attendance', async (req, res) => {
  const { employee_id, date, status, check_in, check_out } = req.body;
  
  if (!employee_id || !date || !status) {
    return res.status(400).json({ error: "Employee ID, date, and status are required" });
  }
  try{
    //check if employe is exists
    const [employee] = await db.query("SELECT id FROM employees WHERE id = ?",[employee_id]);
    if (employee.length === 0){
      return res.status(404).json({ error: "Employ not found"})
    }

    //check if  attendances is already exists
    const [existing] = await db.query("SELECT id FROM attendance WHERE employee_id = ? AND date = ?",
      [employee_id, date]
    );
    if( existing.length > 0){
      return res.status(400).json({error:"Attendance already marked for this date"});
    }

    const sql = ` INSERT INTO attendance (employee_id, date, status, check_in, check_out)
    VALUES (?, ?, ?, ?, ?)`;

    const [result] = await db.query(sql,[
      employee_id,
      date,
      status,
      status === 'present' || status === 'late' || status === 'half_day' ? check_in : null,
      status === 'present' || status === 'half_day' ? check_out : null
    ]);
    res.status(201).json({
      success: true,
      message: "Attendance marked successfully"
    });
} catch(error){
  res.status(500).json({error:'Failed to mark attendance', details: error.message});
}

});


// Get all attendance records
app.get('/api/attendance', async (req, res) => {
  try {
    const [attendance] = await db.query(
      "SELECT a.*, e.name as employee_name FROM attendance a JOIN employees e ON a.employee_id = e.id ORDER BY date DESC"
    );
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch attendance records", details: error.message });
  }
});



connectDB().then(() => {
  app.listen(5000, () =>
    console.log("Server running on http://localhost:5000")
  );
});
