const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const User = require("../Models/user");
const Role = require("../Models/role");
const bcrypt = require("bcrypt");
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
 * /signup:
 *   post:
 *     summary: User registration (signup)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request - Validation errors
 *       500:
 *         description: Internal server error
 *     x-code-samples:
 *       - lang: JavaScript
 *         source: |
 *           // Assuming "io" is the socket.io client
 *           io.emit("adminNotification", { message: "New user registered!" });
 */


router.post(
  "/signup",

  [
    body("full_name")
      .trim()
      .notEmpty()
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2 and 50 characters"),

    body("email")
      .custom(async (value) => {
        const user = await User.findOne({ email: value });
        if (user) {
          throw new Error("E-mail already in use");
        }
      })
      .trim()
      .isEmail()
      .notEmpty()
      .withMessage("Invalid email address"),
    body("password")
      .notEmpty()
      .custom(validatePassword)
      .withMessage(
        "Password must contain at least one lowercase letter, one uppercase letter, one digit, one special character, and be at least 8 characters long"
      ),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { full_name, email, password } = req.body;

      const role = await Role.findOne({ name: "user" });

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        full_name,
        email,
        password: hashedPassword,
        role: role._id,
      });

      await newUser.save();
      const io = req.app.get("io")
      io.emit("adminNotification", { message: "New user registered!" ,data:newUser});

      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
);



function validatePassword(password) {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}[\]\\|;:'",.<>/?]).{8,}$/;
  return passwordRegex.test(password);
}

module.exports = router;
