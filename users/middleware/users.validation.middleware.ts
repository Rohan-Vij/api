import { body, ValidationChain } from 'express-validator';

class UsersValidationMiddleware {
    static createUserValidationRules(): ValidationChain[] {
        return [
            body('email').isEmail(),
            body('password')
                .isLength({ min: 5 })
                .withMessage('Must include password (5+ characters).'),
        ];
    }

    static updateUserValidationRules(method: "put" | "patch"): ValidationChain[] {
        const rules = [
            body('email').isEmail(),
            body('password')
                .isLength({ min: 5 })
                .withMessage('Must include password (5+ characters)'),
            body('firstName').isString(),
            body('lastName').isString(),
            body('permissionFlags').isInt(),
        ]

        if (method === "patch") {
            return rules.map(rule => rule.optional());
          }
        // Return the raw rules list if the method is "put" 
        return rules;
    }
}

export default UsersValidationMiddleware;