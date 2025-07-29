const db = require('../models');
const College = db.College;

exports.createCollege = async (req, res) => {
  try {
    const { name, code, address } = req.body;

    const newCollege = await College.create({ name, code, address });

    return res.status(201).json({
      message: 'College created successfully',
      data: newCollege,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong', error });
  }
};
exports.getAllColleges = async (req, res) => {
  try {
    const colleges = await College.findAll();
    return res.status(200).json({
      message: 'Colleges retrieved successfully',
      data: colleges,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong', error });
  }
};
