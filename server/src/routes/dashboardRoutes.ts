import { Router } from "express";
import { DashboardRoute, StudentDetailsRoute, AddNewAchievementRoute, RemoveStudentAchivementRoute, deleteUser } from "../controllers/dashboardController";
import { JwtVerify, verifyPermission } from "../middleware/auth.middleware";
const router = Router();
router.route("/").get(JwtVerify,DashboardRoute);
router.route("/student/:id").get(JwtVerify,verifyPermission("SCHOOL"),StudentDetailsRoute);
router.route("/add-achievement/:id").post(JwtVerify,verifyPermission("SCHOOL"),AddNewAchievementRoute);
router.route('/deleteachievement/:id').delete(JwtVerify,verifyPermission("SCHOOL"),RemoveStudentAchivementRoute);
router.route('/deleteuser/:id').delete(JwtVerify,verifyPermission("SCHOOL"),deleteUser);
export default router;

