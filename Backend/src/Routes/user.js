const express = require("express");
const router = express.Router();
const User = require("../Models/user");
const Task = require("../Models/task");

const { isAdmin, authMiddleware } = require("../Middleware/Auth");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get a list of users (admin access required)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of users with task counts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserWithTaskCounts'
 *     components:
 *       schemas:
 *         UserWithTaskCounts:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: The user's ID
 *             username:
 *               type: string
 *               description: The username of the user
 *             email:
 *               type: string
 *               description: The email of the user
 *             taskCounts:
 *               type: object
 *               additionalProperties:
 *                 type: integer
 *                 description: The count of tasks for each priority level
 */



router.get("/users", authMiddleware, isAdmin, async (req, res) => {
  try {
    const users = await User.find().populate("tasks");

    const result = await Promise.all(
      users.map(async (user) => {
        const tasks = user.tasks.reduce((acc, task) => {
          if (!acc[task.priority]) {
            acc[task.priority] = 1;
          } else {
            acc[task.priority]++;
          }
          return acc;
        }, {});
        // const task = user.tasks.map((task) => ({
        //   _id: task._id,
        //   title: task.title,
        //   priority: task.priority,
        //   done: task.done,
        // }));
        return {
          _id: user._id,
          username: user.username,
          email: user.email,
          taskCounts: tasks,
          // task: task,
        };
      })
    );

    res.json({
      users: result,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving users", error: error.message });
  }
});


module.exports = router;
