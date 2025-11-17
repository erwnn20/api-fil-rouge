import {Router} from "express";
import * as mwAuth from "../middleware/auth.middleware";
import {getApi} from "../controllers/api.controller";


const apiRoutes = Router();

/**
 * @swagger
 * tags:
 *   name: External-API
 *   description: API to fetch posts and optionally their comments
 */

/**
 * @swagger
 * /api/v2/posts/:
 *   get:
 *     summary: Get all posts
 *     tags: [External-API]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   content:
 *                     type: string
 *                   author:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
apiRoutes.get('/', mwAuth.auth, getApi());

/**
 * @swagger
 * /api/v2/posts/{id}:
 *   get:
 *     summary: Get a specific post
 *     tags: [External-API]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the post
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 *                 author:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
apiRoutes.get('/:id', mwAuth.auth, getApi());

/**
 * @swagger
 * /api/v2/posts/{id}/comments:
 *   get:
 *     summary: Get comments of a specific post
 *     tags: [External-API]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the post
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   content:
 *                     type: string
 *                   author:
 *                     type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
apiRoutes.get('/:id/comments', mwAuth.auth, getApi(true));

export default apiRoutes;