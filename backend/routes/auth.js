import express from "express";
import { signup, login ,googleLogin} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post('/google-login', googleLogin);

export default router;
