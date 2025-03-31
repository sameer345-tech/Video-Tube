import {toggleCommentLike,
toggleVideoLike,
getLikedVideos} from "../controllers/likes_controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const router = Router();

router.route("/toggle-video-like/:videoId").post(verifyJwt, toggleVideoLike);
router.route("/toggle-comment-like/:commentId").post(verifyJwt, toggleCommentLike);
router.route("/get-liked-videos/:userId").get(verifyJwt, getLikedVideos);

export default router;