"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const auth_2 = require("../validators/auth");
const router = (0, express_1.Router)();
// Public endpoints
router.post('/register', auth_2.registerValidator, authController_1.authController.register);
router.post('/login', auth_2.loginValidator, authController_1.authController.login);
router.post('/refresh-token', authController_1.authController.refreshToken);
// Protected endpoints
router.post('/logout', auth_1.authMiddleware, authController_1.authController.logout);
router.post('/change-password', auth_1.authMiddleware, auth_2.resetPasswordValidator, authController_1.authController.changePassword);
exports.default = router;
//# sourceMappingURL=auth.js.map