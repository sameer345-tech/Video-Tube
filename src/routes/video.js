import { Router } from "express";
import {
    publishVideo,
    getAllVideos,
    getVideoById,
    deleteVideo,
    togglePublishStatus,
    updateVideo
} from "../controllers/video.conroller.js";

import upload from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();


router.route("/get-videos").get(getAllVideos);
router.route("/:videoId").get(
    verifyJwt, getVideoById);
router.route("/delete-video/:videoId").delete(verifyJwt, deleteVideo);
router.route("/toggle-publish/:videoId/").patch(verifyJwt, togglePublishStatus);
router.route("/update-video/:videoId").patch(verifyJwt, upload.single("thumbnail"), updateVideo);
router.route("/publish").post(verifyJwt, upload.fields([{ name: "video", maxCount: 1 }, { name: "thumbnail", maxCount: 1 }]), publishVideo);

export default router;

