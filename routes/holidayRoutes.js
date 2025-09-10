import express from "express";
import { createHolidays, getHoliday } from "../controllers/holidayController.js";

const router = express.Router();

router.post('/', createHolidays);
router.get('/', getHoliday);


export default router