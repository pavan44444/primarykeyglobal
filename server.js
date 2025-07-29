require('dotenv').config();
const express = require('express');
const app = express();
const db = require('./models');
const collegeRoutes = require('./routes/collegeRoutes');
const userRoutes = require('./routes/userRoutes');
const companyRoutes = require('./routes/companyRoutes');

app.use(express.json());
app.use('/api', collegeRoutes);
app.use('/api', userRoutes);
app.use('/api', companyRoutes);
db.sequelize.sync().then(() => {
  console.log('Database synced');
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
});
