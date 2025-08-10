const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const quizCategoryRoutes = require("./routes/quizCategoryRoutes");
const quizSubcategoryRoutes = require("./routes/quizSubcategoryRoutes");
const quizTopicRoutes = require("./routes/quizTopicRoutes");
const questionRoutes = require("./routes/questionRoutes");
const questionOptionRoutes = require("./routes/questionOptionRoutes");
const mappingRoutes = require("./routes/questionCompanyMappingRoutes");
const quizRoutes = require("./routes/quizRoutes");
const quizAttemptRoutes = require('./routes/quizAttemptRoutes');
const app = express();
app.use(bodyParser.json());
require("./config/db");
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", quizCategoryRoutes);
app.use("/api/subcategories", quizSubcategoryRoutes);
app.use("/api/topics", quizTopicRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/options", questionOptionRoutes);
app.use("/api/mappings", mappingRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/attempts", quizAttemptRoutes);
app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});
