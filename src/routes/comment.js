import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";

import { 
    createComment,
    updateComment,
    deleteComment,
    getCommentById,
    getVideoComments

 } from "../controllers/comment_controller.js";

 const router = Router();

 router.route("/create-comment/:videoId").post(
    verifyJwt,
    createComment
 );

 router.route("/update-comment/:commentId").patch(
    verifyJwt,
    updateComment
 );

 router.route("/delete-comment/:commentId").delete(
    verifyJwt,
    deleteComment
 );
 router.route("/get-comment/:commentId").get(
    verifyJwt,
    getCommentById
 );
 
 router.route("/get-all-comments/:videoId").get(
    verifyJwt,
    getVideoComments
 );
 
export default router;

