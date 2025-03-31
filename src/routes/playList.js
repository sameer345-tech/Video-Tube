import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controllers/playlist_controller.js"


const router = Router()

router.route("/create-playlist").post(
    verifyJwt,
    createPlaylist
);

router.route("/get-playlists").get(
    verifyJwt,
    getUserPlaylists
);

router.route("/get-playlist/:playlistId").get(
    verifyJwt,
    getPlaylistById
);
router.route("/add-video/:playlistId/:videoId").patch(
    verifyJwt,
    addVideoToPlaylist
);
router.route("/remove-video/:playlistId/:videoId").delete(
    verifyJwt,
    removeVideoFromPlaylist
);
router.route("/delete-playlist/:playlistId").delete(
    verifyJwt,
    deletePlaylist
);
router.route("/update-playlist/:playlistId").patch(
    verifyJwt,
    updatePlaylist
);

export default router
 


