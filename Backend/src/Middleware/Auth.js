const jwt = require("jsonwebtoken");
const User = require("../Models/user");
const Role = require("../Models/role");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.Jwt_secret);
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      throw new Error();
    }
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res
      .status(401)
      .json({ message: "Please authenticate"});
      console.log(error)
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const role = await Role.findById(user.role);
    if (role && role.name === "admin") {
      next();
    } else {
      res
        .status(403)
        .json({
          message: "Access denied. You are not authorized as an admin.",
        });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
module.exports = { isAdmin, authMiddleware };
