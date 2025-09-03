 //Database connection

 import mysql from 'mysql2/promise'

 let db;

 export const connectDB = async () =>{
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

 export const getDB = ()=> db;