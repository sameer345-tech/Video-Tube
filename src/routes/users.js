import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken, changePassword, getCurrentUser, updateAccountInfo, updateAwatar, updateCoverImage, getUserProfile, getWatcHistory } from "../controllers/user.controllers.js";
import upload from "../middlewares/multer.middleware.js"
import { verifyJwt } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    {name: "avatar",
     maxCount: 1
    },
    {name: "coverImage",
     maxCount: 1
    }
  ]),
  registerUser
)
 
router.route("/login").post(loginUser)

router.route("/logout").post(
  verifyJwt,
  logoutUser
)

router.route("/refreshToken").post(
 refreshAccessToken
);

router.route("/change-password").post(verifyJwt, changePassword);

router.route("/get-user").get(verifyJwt, getCurrentUser);

router.route("/update-account").patch(verifyJwt, updateAccountInfo)

router.route("/update-awatar").patch(verifyJwt, upload.single("awatar"), updateAwatar);

router.route("/update-coverImage").patch(verifyJwt, upload.single("coverImage"), updateCoverImage);

router.route("/channel/:userName").get(verifyJwt, getUserProfile);

router.route("/watch-history").get(verifyJwt, getWatcHistory)

export default router;