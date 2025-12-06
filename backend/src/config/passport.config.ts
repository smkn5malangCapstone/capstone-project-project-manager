import passport from "passport";
import { Request } from "express";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptions,
} from "passport-jwt";
import { config } from "./app.config";
import { NotFoundException, BadRequestException } from "../utils/appError";
import { ProviderEnum } from "../enums/account-provider";
import {  
  verifyUserService,
  findUserByEmailService,
  findUserByIdService,
  CreateAccountService,
  LoginAccountService
} from "../services/auth.service";
import AccountModel from "../models/account.model"; 
import { signJwtToken } from "../utils/jwt";

// Strategy untuk Google Register
passport.use(
  'google-register',
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: `${config.GOOGLE_CALLBACK_URL}/callback/register`,
      scope: ["profile", "email"],
      passReqToCallback: true,
    }, 
    async(req: Request, accessToken, refreshToken, profile, done) => {
      try {
        const {email, sub: googleId, picture} = profile._json;
        
        if (!email) {
          return done(new BadRequestException("Email is required"), false);
        }
        
        if (!googleId) {
          return done(new NotFoundException('Google ID (sub) is Missing'), false);
        }

        // Cek apakah user sudah ada
        const existingUser = await findUserByEmailService(email);
        if (existingUser) {
          return done(null, false, { message: "Email already exists. Please login instead." });
        }

        // Buat user baru
        const { user } = await CreateAccountService({
          provider: ProviderEnum.GOOGLE,
          displayName: profile.displayName,
          providerId: googleId,
          picture: picture,
          email: email,
        });
        const jwt = signJwtToken({userId: user._id});
        req.jwt = jwt;
        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

passport.use( 
  'google-login',
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,  
      callbackURL: `${config.GOOGLE_CALLBACK_URL}/callback/login`,
      scope: ["profile", "email"],
      passReqToCallback: true,
    }, 
    async(req: Request, accessToken, refreshToken, profile, done) => {
      try {
        const {email, sub: googleId, picture} = profile._json;
        
        if (!email) {
          return done(null, false, { message: "Email is required" });
        }
        
        if (!googleId) {
          return done(null, false, { message: 'Google ID (sub) is Missing' });
        }

        // Panggil LoginAccountService
        const result = await LoginAccountService({
          provider: ProviderEnum.GOOGLE,
          displayName: profile.displayName,
          providerId: googleId,
          picture: picture,
          email: email,
        });
        
        const jwt = signJwtToken({userId: result.user._id});
        req.jwt = jwt;
        done(null, result.user);
      } catch (error) {
        // Tangkap error dari service dan format untuk Passport.js
        if (error instanceof Error) {
          const message = error.message;
          
          // Ekstrak pesan user-friendly setelah titik dua
          if (message.includes(':')) {
            const userMessage = message.split(':')[1];
            return done(null, false, { message: userMessage });
          }
          
          // Jika format tidak sesuai, gunakan pesan asli
          return done(null, false, { message });
        }
        
        // Untuk error lainnya
        done(error, false);
      }
    }
  )
);

passport.use(new LocalStrategy({
  usernameField: "email",
  passwordField: "password",
  session: false,
  },
    async( email, password, done) =>{
      try {
         const user = await verifyUserService({ email, password});
         return done(null, user)
      } catch (error: any) {
        return done(error, false, { message: error?.message});
      }
    }
  )
);

interface JwtPayload {
  userId : string;
}

const options: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.JWT_SECRET,
  audience: ["user"],
  algorithms: ["HS256"]
};

passport.use(
  new JwtStrategy(options, async (payload: JwtPayload, done) => {
    try {
      const user = await findUserByIdService(payload.userId);
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    } catch (error) {
      return done(null, false);
    }
  })
)
passport.serializeUser((user: any, done) => done(null, user));
passport.deserializeUser((user: any, done) => done(null, user));

export const passportAuthenticateJWT = passport.authenticate("jwt", {
  session: false,
})