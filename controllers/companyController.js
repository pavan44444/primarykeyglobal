const db = require('../config/db');

// Fetch companies visited to the logged-in user's college
exports.getCompaniesByCollege = async (req, res) => {
    try {
        const user_id = req.user.id; // from JWT

        // Get user's college_id
        const [userData] = await db.query(
            'SELECT college_id FROM users WHERE user_id = ?',
            [user_id]
        );

        if (userData.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const college_id = userData[0].college_id;

        // Fetch companies that visited this college
        const [companies] = await db.query(
            `SELECT c.company_id, c.company_name, c.website_url,
                    m.visit_date, m.job_role, m.package_offered, m.eligibility_criteria, 
                    m.visit_status, m.is_active
             FROM company_college_mapping m
             JOIN companies c ON m.company_id = c.company_id
             WHERE m.college_id = ?
             ORDER BY m.visit_date DESC`,
            [college_id]
        );

        res.json(companies);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
// Replace your uploadCompanies function in companyController.js

exports.uploadCompanies = async (req, res) => {
    try {
        console.log("Received company upload request");
        console.log("Request body:", req.body);
        
        const {
            company_name,
            company_code,
            industry,
            logo_url,
            website_url,
            visit_date,
            job_role,
            package_offered,
            eligibility_criteria,
            visit_status,
            college_id
        } = req.body;

        // Log each field for debugging
        console.log("Extracted fields:");
        console.log("- company_name:", company_name);
        console.log("- company_code:", company_code);
        console.log("- visit_date:", visit_date);
        console.log("- college_id:", college_id);

        // Validate required fields with detailed error messages
        const missingFields = [];
        if (!company_name || company_name.trim() === '') missingFields.push('company_name');
        if (!company_code || company_code.trim() === '') missingFields.push('company_code');
        if (!visit_date || visit_date.trim() === '') missingFields.push('visit_date');
        if (!college_id || college_id.toString().trim() === '') missingFields.push('college_id');

        if (missingFields.length > 0) {
            console.log("Missing required fields:", missingFields);
            return res.status(400).json({ 
                message: `Missing required fields: ${missingFields.join(', ')}`,
                received_data: {
                    company_name: company_name || 'MISSING',
                    company_code: company_code || 'MISSING',
                    visit_date: visit_date || 'MISSING',
                    college_id: college_id || 'MISSING'
                }
            });
        }

        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(visit_date)) {
            return res.status(400).json({ 
                message: 'Invalid date format. Use YYYY-MM-DD format',
                received_date: visit_date
            });
        }

        // Check if company already exists in companies table
        const [existingCompany] = await db.query(
            'SELECT company_id FROM companies WHERE company_code = ?',
            [company_code.trim()]
        );

        let company_id;

        if (existingCompany.length === 0) {
            // Company doesn't exist, insert into companies table
            console.log(`Adding new company: ${company_name}`);
            const [companyResult] = await db.query(
                `INSERT INTO companies (company_name, company_code, industry, logo_url, website_url, is_active) 
                 VALUES (?, ?, ?, ?, ?, 1)`,
                [
                    company_name.trim(), 
                    company_code.trim(), 
                    industry ? industry.trim() : null, 
                    logo_url ? logo_url.trim() : null, 
                    website_url ? website_url.trim() : null
                ]
            );
            company_id = companyResult.insertId;
            console.log(`✅ New company added: ${company_name} with ID: ${company_id}`);
        } else {
            // Company exists, use existing company_id
            company_id = existingCompany[0].company_id;
            console.log(`📍 Using existing company: ${company_name} with ID: ${company_id}`);
        }

        // Check if mapping already exists for this college and company on the same date
        const [existingMapping] = await db.query(
            'SELECT mapping_id FROM company_college_mapping WHERE company_id = ? AND college_id = ? AND visit_date = ?',
            [company_id, college_id, visit_date]
        );

        if (existingMapping.length > 0) {
            console.log(`Mapping already exists for ${company_name} on ${visit_date}`);
            return res.status(409).json({ 
                message: `Mapping already exists for ${company_name} on ${visit_date}` 
            });
        }

        // Insert into company_college_mapping table
        console.log(`Creating mapping for company_id: ${company_id}, college_id: ${college_id}`);
        const [mappingResult] = await db.query(
            `INSERT INTO company_college_mapping 
             (company_id, college_id, visit_date, job_role, package_offered, eligibility_criteria, visit_status, is_active) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
            [
                company_id, 
                college_id, 
                visit_date, 
                job_role ? job_role.trim() : null, 
                package_offered, 
                eligibility_criteria ? eligibility_criteria.trim() : null, 
                visit_status || 'Scheduled'
            ]
        );

        console.log(`✅ Mapping created with ID: ${mappingResult.insertId}`);

        res.status(201).json({
            message: 'Company and mapping added successfully',
            company_id: company_id,
            mapping_id: mappingResult.insertId,
            company_name: company_name.trim()
        });

    } catch (err) {
        console.error('Error uploading company:', err);
        res.status(500).json({ 
            message: 'Server error while uploading company',
            error: err.message 
        });
    }
};