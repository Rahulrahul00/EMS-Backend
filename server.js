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

//Add New employee
// app.post("/api/employees", async (req, res) => {
//   const { name, email, designation, department } = req.body;

//   if(!name, !email, !designation, !department) {
//     return res.status(400).json({ error: "All fields are required" });
//   }
//   try {
//     const sql = 'INSERT INTO employees (name, email, designation, department) VALUES (?, ?, ?, ?)';
//     const [result] = await db.query(sql, [name, email, designation, department]);
//     res.json({message: 'Employee added', id: result.insertId});
//   } catch (error) {
//     res.status(500).json({ error: "Failed to add empolyee", details: error.message });
//   }
// });

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

    res.json({ message: "Employee added", employee: newEmployee });
  } catch (error) {
    res.status(500).json({
      error: "Failed to add employee",
      details: error.message,
    });
  }
});

connectDB().then(() => {
  app.listen(5000, () =>
    console.log("Server running on http://localhost:5000")
  );
});
