/**
 * LINODE BACKEND — /auth/user/register setup
 *
 * 1. Add this file to your backend repo (e.g. routes/authRoutes.js)
 * 2. Mount in server.js:
 *      app.use("/api/auth", require("./routes/authRoutes"));
 * 3. Keep existing login routes on /api/auth/login etc.
 * 4. On Linode after deploy:
 *      pm2 restart all   (or your process name)
 *
 * Live test (replace with your Linode domain/IP):
 *   POST https://YOUR_LINODE_DOMAIN/api/auth/user/register
 *
 * Same body as old /users/register — reuse registerUser controller.
 */

const express = require("express");
const router = express.Router();
const { registerUser } = require("../controllers/userController");

router.post("/user/register", registerUser);

// Optional legacy alias on auth router:
// router.post("/register", registerUser);

module.exports = router;
