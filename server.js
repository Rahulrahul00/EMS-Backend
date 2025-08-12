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
  } catch (error) {
    console.log("MySQL connection failed:", error.message);
    process.exit(1); // stop server if DB fails
  }
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
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
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
      res.status(201).json({ message: "Employee added successfully", employee: newEmployee });
  } catch (error) {
    res.status(500).json({
      error: "Failed to add employee",
      details: error.message,
    });
  }
});

// PUT Update employee
// app.put("/api/employees/:id", async (req, res)=>{
//   const {id} = req.params;
//   const {name, email, designation, department} = req.body;

//   if(!name || !email || !designation || !department){
//     return res.status(400).json({ error:"All fields are required"});
//   }

//   const sql = "UPDATE employees SET name=?, email=?, designation=?, department=? WHERE id=?";
//       db.query(sql,[
//         name,
//         email,
//         designation,
//         department,
//         id
//       ], (err, result)=>{
//         if(err) return res.status(500).json({ error: 'Failed to update employee'});
//         if(result.affectedRows === 0 ) return res.status(404).json({ error:'Employee not Found'});
        
//         res.json({ message:"Employee updated successfully", employee: {id,name,email, designation, department}})
//       })
// })

app.put("/api/employees/:id", async (req, res) => {
  const {id} = req.params;
  const {name, email, designation, department} = req.body;

  // Validation
  if(!name || !email || !designation || !department) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const sql = "UPDATE employees SET name=?, email=?, designation=?, department=? WHERE id=?";
  
  db.query(sql, [name, email, designation, department, id], (err, result) => {
    if(err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: 'Failed to update employee' });
    }
    
    if(result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // Get the updated record to ensure consistency
    db.query("SELECT * FROM employees WHERE id = ?", [id], (err, rows) => {
      if(err || rows.length === 0) {
        // Fallback to what we tried to update
        const updatedEmployee = { id, name, email, designation, department };
        return res.json({ employee: updatedEmployee });
      }
      
      // Return the actual updated record from database
      res.json({ employee: rows[0] });
    });
  });
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

    res.json({ message: "Employee deleted successfully", id });
  });
});


connectDB().then(() => {
  app.listen(5000, () =>
    console.log("Server running on http://localhost:5000")
  );
});
