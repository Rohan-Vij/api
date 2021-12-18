import { CommonRoutesConfig } from "../common/common.routes.config";
import UsersController from "./controllers/users.controller";

import UsersMiddleware from "./middleware/users.middleware";
import UsersValidationMiddleware from "./middleware/users.validation.middleware";

import express from "express";

import jwtMiddleware from "../auth/middleware/jwt.middleware";
import permissionMiddleware from "../common/middleware/common.permission.middleware";
import { PermissionFlag } from "../common/middleware/common.permissionflag.enum";

import BodyValidationMiddleware from "../common/middleware/body.validation.middleware";
import RateLimitingMiddleware from "../common/middleware/rate.limiting.middleware";

export class UsersRoutes extends CommonRoutesConfig {

    constructor(app: express.Application) {
        super(app, "UsersRoutes", RateLimitingMiddleware.createLimiter(
            1, // one minute
            2 // 2 requests
        ));
    }

    configureRoutes(): express.Application {
        this.app
            .route(`/users`)
            .all(
                RateLimitingMiddleware.verifyLimiter(this.limiter),
            )
            .get(
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.permissionFlagRequired(
                    PermissionFlag.ADMIN_PERMISSION
                ),
                UsersController.listUsers
            )
            .post(
                ...UsersValidationMiddleware.createUserValidationRules(),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                UsersMiddleware.validateSameEmailDoesntExist,
                UsersController.createUser
            );

        this.app.param(`userId`, UsersMiddleware.extractUserId);
        this.app
            .route(`/users/:userId`)
            .all(
                UsersMiddleware.validateUserExists,
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.onlySameUserOrAdminCanDoThisAction
            )
            .get(UsersController.getUserById)
            .delete(UsersController.removeUser);

        this.app.put(`/users/:userId`, [
            ...UsersValidationMiddleware.updateUserValidationRules("put"),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            UsersMiddleware.validateSameEmailBelongToSameUser,
            UsersMiddleware.userCantChangePermission,
            permissionMiddleware.permissionFlagRequired(
                PermissionFlag.PAID_PERMISSION
            ),
            UsersController.put,
        ]);

        this.app.patch(`/users/:userId`, [
            ...UsersValidationMiddleware.updateUserValidationRules("patch"),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            UsersMiddleware.validatePatchEmail,
            UsersMiddleware.userCantChangePermission,
            permissionMiddleware.permissionFlagRequired(
                PermissionFlag.PAID_PERMISSION
            ),
            UsersController.patch,
        ]);

        this.app.put(`/users/:userId/permissionFlags/:permissionFlags`, [
            jwtMiddleware.validJWTNeeded,
            permissionMiddleware.onlySameUserOrAdminCanDoThisAction,

            // Note: The above two pieces of middleware are needed despite
            // the reference to them in the .all() call, because that only covers
            // /users/:userId, not anything beneath it in the hierarchy

            permissionMiddleware.permissionFlagRequired(
                PermissionFlag.FREE_PERMISSION
            ),
            UsersController.updatePermissionFlags,
        ]);

        return this.app;
    }
}
