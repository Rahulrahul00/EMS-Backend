import express from "express";
import cors from "cors";
// import mysql from "mysql2/promise";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";
// import nodemailer from 'nodemailer';
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from "./routes/employeeRoutes.js";
import attendanceRoutes from './routes/attendanceRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import holidayRoutes from './routes/holidayRoutes.js';
import {connectDB} from './config/db.js';
import { createHolidayTable } from "./models/Holiday..js";
import { createLeaveTable } from "./models/Leave.js";





const app = express();
app.use(cors());
app.use(express.json());


//Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendances', attendanceRoutes);
app.use('/api/leavereports', leaveRoutes);
app.use('/api/holidayreport', holidayRoutes);


//JWT Secret Key
// const JWT_SECRET = "myems123";

// SMTP Configuration
// const SMTP_CONFIG = {
//   host: 'smtp.gmail.com',
//   port:465,
//   secure: false,
//   auth:{
//     user:'rahulcshaji007@gmail.com',
//     pass:'bagv auvv cyxg bucm'
//   }
// }

// Create transporter
export const createTransporter = () => {
  return nodemailer.createTransporter(SMTP_CONFIG);
};

//sent verfication email
// const sentVerificationEmail = async (email, token) => {
//   const transporter = createTransporter();
//   const verificationLink = `http://localhost:5000/api/verify-email?token=${token}`;

//   const mailOptions = {
//     from : SMTP_CONFIG.auth.user,
//     to: email,
//     subject: 'Verify Your Email',
//     html:`
//       <h2>Email Verification</h2>
//       <p>Please click the link below to verify your email address:</p>
//       <a href="${verificationLink}">Verify Email</a>
//       <p>This link will expire in 24 hours.</p>
//     `
//   };
//   await transporter.sendMail(mailOptions);
//   console.log(`Verification email sent to ${email}`);
// }

// Connect to MySQL
// let db;

// const connectDB = async () => {
//   try {
//     db = await mysql.createConnection({
//       host: "localhost",
//       user: "root",
//       password: "",
//       database: "company", //data base name
//     });
//     console.log("connected to MySQL Database");
    
//     await createUserTable();
//     await createAttendanceTable();
//   } catch (error) {
//     console.log("MySQL connection failed:", error.message);
//     process.exit(1); // stop server if DB fails
//   }
// };

//User table
// const createUserTable = async () =>{
//   await db.query(`
//       CREATE TABLE IF NOT EXISTS users(
//          id INT AUTO_INCREMENT PRIMARY KEY,
//          name VARCHAR(255) NOT NULL,
//          email VARCHAR(255) UNIQUE NOT NULL,
//          password VARCHAR(255) NOT NULL,
//          role ENUM('admin', 'employee') DEFAULT 'employee',
//          is_verified BOOLEAN DEFAULT FALSE,
//          verification_token VARCHAR(255),
//          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       ) 
//     `);
// }

// Attendance Section
// const createAttendanceTable = async () => {
//   await db.query(`
//     CREATE TABLE IF NOT EXISTS attendance(
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     employee_id INT NOT NULL,
//     date DATE NOT NULL,
//     status ENUM('present', 'absent', 'late', 'half_day') NOT NULL,
//     check_in TIME,
//     check_out TIME,
//     FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
//     UNIQUE KEY unique_attendance (employee_id, date)
//     )
//     `);
// }; 

// Middleware to verify JWT Token
// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1]; //Bearer Token

//   if (!token) {
//     return res.status(401).json({ error: "Access token required" });
//   }

//   jwt.verify(token, JWT_SECRET, (err, user) => {
//     if (err) {
//       return res.status(403).json({ error: "Invaild or Expired token" });
//     }
//     req.user = user;
//     next();
//   });
// };

//User Registration
// app.post("/api/register",  async (req, res) => {
//   const { name, email, password, role = "employee" } = req.body;

//   if (!name || !email || !password) {
//     return res.status(400).json({success:false, message: "All fields are required" });
//   }

//   try {
//     //check if user already exists
//     const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email,]);
//     if (existing.length > 0) {
//       return res
//         .status(400)
//         .json({ success:false, message: "User already exists with this email" });
//     }

//     //Hash password
//     const saltRounds = 10;
//     const hashedPassword = await bcrypt.hash(password, saltRounds);

//     //Generate a verifaction token
//     const verificationToken = jwt.sign({ email}, JWT_SECRET, {expiresIn:'24h'});

//     //Insert new user
//     const sql =
//       "INSERT INTO users (name, email, password, role, verification_token) VALUES (?, ?, ?, ?)";
//     const [result] = await db.query(sql, [name, email, hashedPassword, role, verificationToken]);

//     //send verification email
//     await sentVerificationEmail(email, verificationToken);

//     //Generate JWT token
//     const token = jwt.sign(
//       { userId: result.insertId, email, role },
//       JWT_SECRET,
//       { expiresIn: "24h" }
//     );

//     res
//       .status(201)
//       .json({
//         success: true,
//         message: "User Registered  successfully.Please check your email for verification",
//         token,
//         user: { id: result.insertId, name, email, role },
//       });
//   } catch (error) {
//     res
//       .status(500)
//       .json({success:false, message: "Failed to register user", details: error.message });
//   }
// });

//email verification endpoint
// app.get('/api/verify-email', async (req, res)=>{
//   const {token} = req.query;

//   if(!token){
//     return res.status(400).json({success: false, message:"Verification token is required"});
//   }
//   try{
//     //verify token
//     const decoded = jwt.verify(token, JWT_SECRET);

//     //Update user verification status
//     const [result] = await db.query(`
//         UPDATE users 
//         SET is_verified = TRUE, verification_token = NULL
//         WHERE email = ?  AND verification_token = ?     
//       `,[decoded.email, token]);

//       if(result.affectedRows === 0){
//         return res.status(400).json({ success: false, message:"Invalid or expired verification token"})
//       }
//       res.json({ success:true, message:"Email verified successfully"});
//   }catch(error){
//     res.status(400).json({ success: false, message: "Invalid or expired verification token"});
//   }
// }); 

//User Login
// app.post("/api/login", async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ error: "Email and password are required" });
//   }
//   try {
//     //Find user  by email
//     const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
//     if (users.length === 0) {
//       return res.status(401).json({ error: "Invaild email or password" });
//     }

//     const user = users[0];

//     //check password
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ error: "Invalid email or password" });
//     }

//     //Generate JWT Token
//     const token = jwt.sign(
//       { userId: user.id, email: user.email, role: user.role },
//       JWT_SECRET,
//       { expiresIn: "24h" }
//     );

//     res.json({
//       success: true,
//       message: "Login successful",
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         // role: user.role,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to login", details: error.message });
//   }
// });

// //Get user profile
// app.get('/api/profile', authenticateToken, async (req, res)=>{
//     try{
//       const [users] = await db.query("SELECT id, name, email, role FROM users WHERE id = ?",
//         [req.user.userId]);
//         if (users.length === 0){
//           return res.status(404).json({error:'User not found'});
//         }
//         res.json({ user: users[0]});
//   }catch(error){
//     res.status(500).json({error:"Failed to fetch profile", details:error.message});
//   }
// })

//Get all Employess
// app.get("/api/employees", authenticateToken, async (req, res) => {
//   try {
//     const [rows] = await db.query("SELECT * FROM employees");
//     res.json(rows);
//   } catch (error) {
//     res
//       .status(500)
//       .json({ error: "Failed to fetch employees", details: error.message });
//   }
// });

// Add New employee
// app.post("/api/employees", authenticateToken, async (req, res) => {
//   const { name, email, designation, department } = req.body;

//   if (!name || !email || !designation || !department) {
//     return res
//       .status(400)
//       .json({ success: false, error: "All fields are required" });
//   }

//   try {
//     //check if email already exists
//     const [existing] = await db.query(
//       "SELECT id FROM employees WHERE email = ?",
//       [email]
//     );
//     if (existing.length > 0) {
//       return res
//         .status(400)
//         .json({
//           success: false,
//           error: "Email already exists",
//           field: "email",
//         });
//     }
//     const sql =
//       "INSERT INTO employees (name, email, designation, department) VALUES (?, ?, ?, ?)";
//     const [result] = await db.query(sql, [
//       name,
//       email,
//       designation,
//       department,
//     ]);

//     // Return the new employee object
//     const newEmployee = {
//       id: result.insertId,
//       name,
//       email,
//       designation,
//       department,
//     };

//     // res.json({ message: "Employee added", employee: newEmployee });
//     res
//       .status(201)
//       .json({
//         success: true,
//         message: "Employee added successfully",
//         employee: newEmployee,
//       });
//   } catch (error) {
//     res
//       .status(500)
//       .json({
//         success: false,
//         error: "Failed to add employee",
//         details: error.message,
//       });
//   }
// });

// PUT Update employee
// app.put("/api/employees/:id",authenticateToken, async (req, res) => {
//   const id = req.params.id;
//   const { name, email, designation, department } = req.body;
//   if (!name || !email || !designation || !department) {
//     return res.status(400).json({ error: "All fields are required" });
//   }
//   try {
//     const sql =
//       "UPDATE employees SET name=?, email=?, designation=?, department=? WHERE id=?";
//     const [result] = await db.query(sql, [
//       name,
//       email,
//       designation,
//       department,
//       id,
//     ]);
//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: "Employee not found" });
//     }
//     // Fetch the updated employee
//     const [rows] = await db.query("SELECT * FROM employees WHERE id = ?", [id]);
//     if (rows.length === 0) {
//       return res.status(404).json({ error: "Employee not found after update" });
//     }
//     res.json({ message: "Employee updated successfully", employee: rows[0] });
//   } catch (error) {
//     console.error("Update error:", error);
//     res
//       .status(500)
//       .json({ error: "Failed to update employee", details: error.message });
//   }
// });

// Delete employee
// app.delete("/api/employees/:id",authenticateToken, (req, res) => {
//   const id = parseInt(req.params.id, 10);

//   if (isNaN(id)) {
//     return res.status(400).json({ error: "Invalid employee ID" });
//   }

//   const sql = "DELETE FROM employees WHERE id = ?";
//   db.query(sql, [id], (err, result) => {
//     if (err) {
//       console.error("Delete error:", err);
//       return res.status(500).json({ error: "Failed to delete employee" });
//     }

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: "Employee not found" });
//     }

//     res.status(200).json({ message: "Employee deleted successfully", id });
//   });
// });

// Attendance Marking
// app.post("/api/attendance", authenticateToken, async (req, res) => {
//   const { employee_id, date, status, check_in, check_out } = req.body;

//   if (!employee_id || !date || !status) {
//     return res
//       .status(400)
//       .json({ error: "Employee ID, date, and status are required" });
//   }
//   try {
//     //check if employe is exists
//     const [employee] = await db.query("SELECT id FROM employees WHERE id = ?", [
//       employee_id,
//     ]);
//     if (employee.length === 0) {
//       return res.status(404).json({ error: "Employ not found" });
//     }

//     //check if  attendances is already exists
//     const [existing] = await db.query(
//       "SELECT id FROM attendance WHERE employee_id = ? AND date = ?",
//       [employee_id, date]
//     );
//     if (existing.length > 0) {
//       return res
//         .status(400)
//         .json({ error: "Attendance already marked for this date" });
//     }

//     const sql = ` INSERT INTO attendance (employee_id, date, status, check_in, check_out)
//     VALUES (?, ?, ?, ?, ?)`;

//     const [result] = await db.query(sql, [
//       employee_id,
//       date,
//       status,
//       status === "present" || status === "late" || status === "half_day"
//         ? check_in
//         : null,
//       status === "present" || status === "half_day" ? check_out : null,
//     ]);
//     res.status(201).json({
//       success: true,
//       message: "Attendance marked successfully",
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ error: "Failed to mark attendance", details: error.message });
//   }
// });

// Get all attendance records
// app.get("/api/attendance", authenticateToken, async (req, res) => {
//   try {
//     const [attendance] = await db.query(
//       "SELECT a.*, e.name as employee_name FROM attendance a JOIN employees e ON a.employee_id = e.id ORDER BY date DESC"
//     );
//     res.json(attendance);
//   } catch (error) {
//     res
//       .status(500)
//       .json({
//         error: "Failed to fetch attendance records",
//         details: error.message,
//       });
//   }
// });

connectDB()
  .then(async () => {
    console.log("MySQL connected");

    // 👇 Create table if not exists
    await createLeaveTable();
    await createHolidayTable();
    console.log("leave_reports table ready");
    

    app.listen(5000, () =>
      console.log("Server running on http://localhost:5000")
    );
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
  });

// connectDB().then(() => {
//   app.listen(5000, () =>
//     console.log("Server running on http://localhost:5000")
//   );
// });
