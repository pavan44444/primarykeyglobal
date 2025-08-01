const Company = require('../models/Company');

// --- ADMIN-ONLY FUNCTIONS ---

// Add a new company (Admin-only)
exports.addCompany = async (req, res) => {
  try {
    const { name, logo, city, state, industry, companyType } = req.body;

    // Basic input validation
    if (!name || !city || !industry || !companyType) {
      return res.status(400).json({ 
        message: 'Company name, city, industry, and company type are required.' 
      });
    }

    const company = await Company.create({
      name,
      logo,
      city,
      state,
      industry,
      companyType,
    });

    res.status(201).json({
      message: 'Company added successfully',
      company
    });
  } catch (error) {
    console.error('Add company error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a company (Admin-only)
exports.deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Company.destroy({
      where: { id: id }
    });

    if (deleted) {
      return res.status(204).send(); // 204 No Content
    }

    res.status(404).json({ message: 'Company not found.' });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all companies (Admin-only)
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll();
    console.log('Fetched companies:', companies);

    res.status(200).json(companies);
  } catch (error) {
    console.error('Get all companies error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get company by ID (Admin-only)
exports.getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const company = await Company.findByPk(id);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found.' });
    }
    
    res.status(200).json(company);
  } catch (error) {
    console.error('Get company by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};