import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { config } from "../config/app.config";
import { registerSchema } from "../validation/auth.validation";
import { HTTPSTATUS } from "../config/http.config";
import { registerUserService } from "../services/auth.service";
import passport from "passport";
import { signJwtToken } from "../utils/jwt";

// Tambahkan controller ini
export const googleRegisterCallBack = asyncHandler(async(req: Request, res:Response) => {
  const jwt = req.jwt;
  const currentWorkspace = req.user?.currentWorkspace;

  if (!jwt) {
    return res.redirect(
      `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure&action=register`
    )
  }  
  // return res.redirect(
  //   `${config.FRONTEND_ORIGIN}/workspace/${currentWorkspace}?action=register`
  // )
  return res.redirect(
    `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=success&access_token=${jwt}&current_workspace=${currentWorkspace}?action=register`
  )
});

// Update googleLoginCallBack untuk handle action
export const googleLoginCallBack = asyncHandler(async(req: Request, res:Response) => {
  const jwt = req.jwt;
  const currentWorkspace = req.user?.currentWorkspace;

  if (!jwt) {
    return res.redirect(
      `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure&action=login`
    )
  }
  // return res.redirect(
  //   `${config.FRONTEND_ORIGIN}/workspace/${currentWorkspace}?action=login`
  // )
  return res.redirect(
    `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=success&access_token=${jwt}&current_workspace=${currentWorkspace}?action=login`
  )
});

export const registerUserController = asyncHandler(
  async(req: Request, res: Response) => {
    const body = registerSchema.parse({
      ...req.body,
    });

    await registerUserService(body);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "User Created Successfully",
    })
  }
);

export const loginController = asyncHandler(async(req: Request, res: Response, next:NextFunction) => {
  passport.authenticate("local", (
      err: Error | null, 
      user: Express.User | false,
      info: { message: string} | undefined,
      ) => {
        if (err) {
          return next(err)
        }

        if (!user) {
          return res.status(HTTPSTATUS.UNAUTHORIZED).json({
            message: info?.message || "Invalid email or password"
          });
        }

        const access_token = signJwtToken({ userId: user._id})

        return res.status(HTTPSTATUS.OK).json({
          message: "Logged in successfully",
          access_token,
          user,
        });
      }
    )(req, res, next);
  }
);

export const logOutController = asyncHandler(async(req: Request, res:Response) => {
  req.logout((err) => {
    if (err) {
      console.error("Error Logout: ", err);
      return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
        error: "failed to logout"
      });
    }
  });
  req.session = null;
  return res.status(HTTPSTATUS.OK).json({
    message: "Logged out succesfully"
  });
});