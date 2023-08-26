const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Models/user");

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * /login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: User not found or invalid password
 *       500:
 *         description: Internal server error
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate("role");

    if (!user) {
      return res
        .status(401)
        .json({ message: "User not found or invalid password" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res
        .status(401)
        .json({ message: "User not found or invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.Jwt_secret,
      { expiresIn: "1h" }
    );
    const io = req.app.get("io")
    io.emit("LoginNotification", { message: "Logged In !" });
    res.json({
      message: "User login successfully",
      data: {
        token,
        user: {
          id: user._id,
          full_name: user.full_name,
          email: user.email,
          role: {
            id: user.role._id,
            name: user.role.name,
          },
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error",error:error.message });
  }
});

module.exports = router;
