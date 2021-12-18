import { CommonRoutesConfig } from "../common/common.routes.config";
import authController from "./controllers/auth.controller";
import authMiddleware from "./middleware/auth.middleware";
import jwtMiddleware from "./middleware/jwt.middleware";
import express from "express";
import BodyValidationMiddleware from "../common/middleware/body.validation.middleware";
import { body } from "express-validator";

import RateLimitingMiddleware from "../common/middleware/rate.limiting.middleware";

export class AuthRoutes extends CommonRoutesConfig {
  constructor(app: express.Application) {
    super(
      app,
      "AuthRoutes",
      RateLimitingMiddleware.createLimiter(
        1, // one minute
        2 // 2 requests
      )
    );
  }

  configureRoutes(): express.Application {
    this.app.post(`/auth`, [
      body("email").isEmail(),
      body("password").isString(),
      BodyValidationMiddleware.verifyBodyFieldsErrors,
      authMiddleware.verifyUserPassword,
      authController.createJWT,
    ]);

    this.app.post(`/auth/refresh-token`, [
      jwtMiddleware.validJWTNeeded,
      jwtMiddleware.verifyRefreshBodyField,
      jwtMiddleware.validRefreshNeeded,
      authController.createJWT,
    ]);

    return this.app;
  }
}
