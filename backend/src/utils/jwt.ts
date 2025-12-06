import jwt,{ SignOptions } from "jsonwebtoken";
import { UserDocument } from "../models/user.model"
import { config } from "../config/app.config";


export type AccessTPayload = {
  userId: UserDocument["_id"];
};

type SignOptsAndSecret = SignOptions & {
  secret: string;
};

const defaults: SignOptions = {
  audience: ["user"],
};

type JwtExpiresIn = SignOptions['expiresIn'];

export const accessTokenSignOptions: SignOptsAndSecret = {
  expiresIn: config.JWT_EXPIRES_IN as JwtExpiresIn,
  secret: config.JWT_SECRET,
};

export const signJwtToken = (
  payload: AccessTPayload,
  option?: SignOptsAndSecret
) => {
  const { secret, ...opts } = option || accessTokenSignOptions;
  return jwt.sign(payload, secret, {
    ...defaults,
    ...opts,
  });
};