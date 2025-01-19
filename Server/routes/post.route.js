import express from 'express';
import multer from 'multer';
import { createPost,deletePost,getPostById, getPosts,likePost,commentPost} from '../controllers/post.controller.js';
import protectedRoute from '../middleware/protectedRoute.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', upload.single('image'), createPost);
router.post('/like/:id',protectedRoute, likePost);
router.post('/comment/:id',protectedRoute, commentPost);
router.get('/getposts',protectedRoute, getPosts);
router.get('/getpossbyid/:id', getPostById);

export default router;
