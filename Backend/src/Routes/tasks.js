const express = require("express");
const router = express.Router();
const Task = require("../Models/task");
const User = require("../Models/user");
const Role = require("../Models/role");
const { authMiddleware, isAdmin } = require("../Middleware/Auth");

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management endpoints
 */

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               priority:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Error creating task
 */

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update a task's details
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the task to be updated.
 *     requestBody:
 *       name: task
 *       required: true
 *       description: Task object containing updated details
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: New title for the task
 *               priority:
 *                 type: string
 *                 description: New priority for the task
 *               done:
 *                 type: boolean
 *                 description: New status of the task (true if done, false otherwise)
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 task:
 *                   $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 *       500:
 *         description: Error updating task
 */

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task by ID
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 *       500:
 *         description: Error deleting task
 */

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get tasks with pagination
 *     description: Retrieve tasks with pagination support
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful response with tasks
 *         content:
 *           application/json:
 *             example:
 *               - task1: Task 1 details...
 *               - task2: Task 2 details...
 *       401:
 *         description: Unauthorized, authentication required
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               message: Error retrieving tasks
 *               error: Error details...
 */

/**
 * @swagger
 * /tasks/{taskId}:
 *   get:
 *     summary: Get a task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the task to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved the task
 *       404:
 *         description: Task not found
 *       500:
 *         description: Server error
 */

// Create a new task
router.post("/tasks", authMiddleware, async (req, res) => {
  const { title, priority } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newTask = await Task.create({ title, priority, user: user._id });

    user.tasks.push(newTask._id);
    await user.save();
    const io = req.app.get("io");
    io.emit("taskNotification", { message: "New task added!" });
    res.status(201).json(newTask);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating task", error: error.message });
  }
});

// Update a task with priority and mark as done

router.put("/tasks/:id", authMiddleware, async (req, res) => {
  try {
    const taskId = req.params.id;
    const { title, priority, done } = req.body;
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { title, priority, done },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    const user = await User.findOne({ _id: req.user.id }).populate("tasks");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const taskIndex = user.tasks.findIndex(
      (task) => task._id.toString() === taskId
    );

    if (taskIndex === -1) {
      return res
        .status(404)
        .json({ message: "Task not found in user's tasks" });
    }

    user.tasks[taskIndex] = updatedTask;
    await user.save();
    const io = req.app.get("io");
    io.emit("taskNotification", { message: "Task Updated!" });
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Error updating task" });
  }
});

// Delete a task by ID

router.delete("/tasks/:id", authMiddleware, async (req, res) => {
  const taskId = req.params.id;

  try {
    const user = await User.findOne({ _id: req.user.id }).populate("tasks");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const taskIndex = user.tasks.findIndex(
      (task) => task._id.toString() === taskId
    );

    if (taskIndex === -1) {
      return res.status(404).json({ message: "Task not found" });
    }

    const deletedTask = user.tasks.splice(taskIndex, 1)[0];

    await user.save();

    await Task.findByIdAndDelete(deletedTask._id);
    const io = req.app.get("io");
    io.emit("taskNotification", { message: "task deleted!" });
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task" });
  }
});

// Retrieve the list of tasks with pagination
// router.get("/tasks", async (req, res) => {
//   const page = parseInt(req.query.page) || 1;
//   const limit = parseInt(req.query.limit) || 10;

//   try {
//     const totalTasks = await Task.countDocuments({});
//     console.log(totalTasks);
//     const totalPages = Math.ceil(totalTasks / limit);
//     const tasks = await Task.find({})
//       .skip((page - 1) * limit)
//       .limit(limit);
//     res.json({
//       tasks,
//       currentPage: page,
//       totalPages,
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error retrieving tasks", error: error.message });
//   }
// });

router.get("/tasks", authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    let tasks = [];
    const userID = req.user.id;
    const user = await User.findById(userID);
    const role = await Role.findById(user.role);

    if (role.name === "admin") {
      if (req.query.user_id) {
        const user = await User.findById(req.query.user_id).populate({
          path: "tasks",
          options: {
            limit: limit,
            skip: (page - 1) * limit,
          },
        });
        tasks = user ? user.tasks : [];
      } else {
        tasks = await Task.find({ user: req.user.id })
          .limit(limit)
          .skip((page - 1) * limit);
      }
    } else {
      const user = await User.findById(req.user.id).populate({
        path: "tasks",
        options: {
          limit: limit,
          skip: (page - 1) * limit,
        },
      });

      tasks = user ? user.tasks : [];
    }

    res.json(tasks);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving tasks", error: error.message });
  }
});

router.get("/tasks/:taskId", authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
