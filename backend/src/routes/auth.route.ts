import { Router } from "express";
import passport from "passport";
import { config } from "../config/app.config";
import { googleLoginCallBack, googleRegisterCallBack, loginController, logOutController, registerUserController } from "../controllers/auth.controller";

const failedUrl = `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`;

const authRoutes = Router();

// Local Auth
authRoutes.post("/register", registerUserController);
authRoutes.post("/login", loginController);
authRoutes.post("/logout", logOutController);

// 🔥 TAMBAHKAN INITIATION ROUTES INI:
// Route untuk MULAI Google Register
authRoutes.get(
  "/google/register",
  passport.authenticate("google-register", {
    scope: ["profile", "email"],
    session: false,
  })
);

// Route untuk MULAI Google Login  
authRoutes.get(
  "/google/login",
  passport.authenticate("google-login", {
    scope: ["profile", "email"],
    session: false,
  })
);

// Callback routes (yang sudah ada) - UNTUK HANDLE RESPONSE DARI GOOGLE
authRoutes.get(
  "/google/callback/register",
  passport.authenticate("google-register", {
    failureRedirect: failedUrl,
    failureMessage: true,
    session: false,
  }),
  googleRegisterCallBack
);

authRoutes.get(
  "/google/callback/login",
  passport.authenticate("google-login", {
    failureRedirect: failedUrl,
    session: false,
  }),
  googleLoginCallBack
);

export default authRoutes;