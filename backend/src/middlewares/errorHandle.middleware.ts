import { ErrorRequestHandler, Response } from "express";
import { HTTPSTATUS } from "../config/http.config";
import { AppError } from "../utils/appError";
import { z, ZodError } from "zod";
import { ErrorCodeEnum } from "../enums/error-code.enum";

const formatZodError = (res: Response, err: z.ZodError) =>{
  const errors = err?.issues?.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
      message: "Validation Failed",
      errors: errors,
      errorCode: ErrorCodeEnum.VALIDATION_ERROR,
    })
}

export const errorHandler:ErrorRequestHandler = (error, req, res, next): any => {

  console.error(`Error Occured on PATH: ${req.path}`, error);

  if(error instanceof SyntaxError){
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
      message: "Invalid Json Syntax",
      error: error.message,
    })
  }

  if(error instanceof ZodError){
    return formatZodError(res, error);
  }
  
  if(error instanceof AppError){
    return res.status(error.statusCode).json({
      message: error.message,
      errorCode: error.errorCode, 
    });
  }
  
  return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
    message: "Internal Server Error",
    error: error?.message || "Unknown Error Occurred",
  })
}

export default errorHandler;