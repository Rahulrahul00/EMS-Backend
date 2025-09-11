import { getDB } from "../config/db.js";


export const createHolidays = async(req, res) =>{
    const db = getDB();

    try{
        const { name, date, type} = req.body;

    //Check if holiday with same date already exists
    const [existing] = await db.query(
        "SELECT * FROM holidays WHERE date = ?",
        [date]
    );
    if(existing.length > 0){
        return res.status(400).json({error:"Holiday with this date already exists"});
    }    
        //Insert new holiday
        const [result] = await db.query(
             "INSERT INTO holidays( name, date, type) VALUES (? , ? , ? )",
             [ name, date, type]
        );
        res.status(201).json({ id: result.insertId, name, date, type})

    }catch(error){
        res.status(500).json({error:error.message})
    }
}

export const getHoliday = async (req, res) =>{
    const db = getDB();
    try{
        const [rows] = await db.query("SELECT * FROM holidays ORDER BY date ASC");
        res.json(rows);

    }catch(error){
        res.status(500).json({ error: error.message});
    }
}