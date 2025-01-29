import { Router } from 'express';
import { EmailVarificationRoute, ForgotPasswordRoute, LoginRoute, LogoutRoute, RegisterRoute, ResetPasswordRoute } from '../controllers/authController';
const router = Router();

// Register Route
router.route('/register').post( RegisterRoute);
router.route('/verify-email').post( EmailVarificationRoute);
router.route('/login').get( LoginRoute);
router.route('/forgot-password').post( ForgotPasswordRoute);
router.route('/reset-password').post( ResetPasswordRoute);
router.route('/logout').post( LogoutRoute);
export default router;