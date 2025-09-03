//Register, Login, Verify Email, Profile
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {getDB} from '../config/db.js';
import { sentVerificationEmail } from '../config/mailer.js';
import { JWT_SECRET } from '../config/jwt.js';


//Registration
export const registerUser =  async (req, res) => {
  const { name, email, password, role = "employee" } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({success:false, message: "All fields are required" });
  }

  try {
    const db = getDB();
    //check if user already exists
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email,]);
    if (existing.length > 0) {
      return res
        .status(400)
        .json({ success:false, message: "User already exists with this email" });
    }

    //Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    //Generate a verifaction token
    const verificationToken = jwt.sign({ email}, JWT_SECRET, {expiresIn:'24h'});

    //Insert new user
    const sql =
      "INSERT INTO users (name, email, password, role,  verification_token) VALUES (?, ?, ?, ?, ?)";
    const [result] = await db.query(sql, [name, email, hashedPassword, role, verificationToken]);

    //send verification email
    await sentVerificationEmail(email, verificationToken);

    //Generate JWT token
    const token = jwt.sign(
      { userId: result.insertId, email, role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res
      .status(201)
      .json({
        success: true,
        message: "User Registered  successfully.Please check your email for verification",
        token,
        user: { id: result.insertId, name, email, role },
      });
  } catch (error) {
    res
      .status(500)
      .json({success:false, message: "Failed to register user", details: error.message });
  }
};

//email verification
export const verifyEmail = async (req, res)=>{
  const {token} = req.query;

  if(!token){
    return res.status(400).json({success: false, message:"Verification token is required"});
  }
  try{
    const db = getDB();
    //verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    //check the user is exists
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [decoded.email]);
    if(users.length === 0){
      return res.status(400).json({success:false, message:'Invalid token: user not found'});
    }
    const user = users[0];

    //if already verified
    if(user.is_verified){
      return res.json({success: false, message:"Already verified"});
    }

    //Update user verification status
    const [result] = await db.query(`
        UPDATE users 
        SET is_verified = TRUE, verification_token = NULL
        WHERE email = ?  AND verification_token = ?     
      `,[decoded.email, token]);

      if(result.affectedRows === 0){
        return res.status(400).json({ success: false, message:"Invalid or expired verification token"})
      }
      return res.json({ success: true, message: "Email verified successfully" });

      
      // res.json({ success:true, message:"Email verified successfully"});
    // return res.redirect("http://localhost:5173/login"); 

    
  }catch(error){
    res.status(400).json({ success: false, message: "Invalid or expired verification token"});
   }


//    if (result.affectedRows === 0) {
//       return res.redirect("http://localhost:5173/verify?status=invalid");
//     }

//     return res.redirect("http://localhost:5173/verify?status=success");

//   } catch (error) {
//     return res.redirect("http://localhost:5173/verify?status=invalid");
//   }
};

//User Login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  try {
    const db = getDB();
    //Find user  by email
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: "Invaild email or password" });
    }

    const user = users[0];

    //check if email is verified
    if(!user.is_verified){
      return res.status(403).json({success:false, message:"Please check your email for verification",})
    }

    //check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    //Generate JWT Token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        // role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to login", details: error.message });
  }
};

//User Profile
export const getProfile =  async (req, res)=>{
    try{
        const db = getDB();
      const [users] = await db.query("SELECT id, name, email, role FROM users WHERE id = ?",
        [req.user.userId]);
        if (users.length === 0){
          return res.status(404).json({error:'User not found'});
        }
        res.json({ user: users[0]});
  }catch(error){
    res.status(500).json({error:"Failed to fetch profile", details:error.message});
  }
};