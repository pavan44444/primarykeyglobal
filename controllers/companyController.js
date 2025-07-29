const db = require('../models');
const Company = db.Company;

exports.createCompany = async (req, res) => {
  try {
    const { name, code, website } = req.body;

    const newCompany = await Company.create({ name, code, website});

    return res.status(201).json({
      message: 'Company created successfully',
      data: newCompany,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong', error });
  }
};
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll();
    return res.status(200).json({
      message: 'Companies retrieved successfully',
      data: companies,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong', error });
  }
};