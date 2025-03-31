import {getChannelStats, 
    getChannelVideos} from "../controllers/dashboard_controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { Router } from "express";

const router = Router();

router.route("/get-channel-stats/:channelId").get(verifyJwt, getChannelStats);
router.route("/get-channel-videos/:channelId").get(verifyJwt, getChannelVideos);

export default router;