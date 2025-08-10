const db = require("../config/db");

// ✅ Create a new mapping
exports.createMapping = (req, res) => {
    const { question_id, company_id, frequency_count, last_asked_date, interview_round } = req.body;

    const sql = `INSERT INTO question_company_mapping 
                (question_id, company_id, frequency_count, last_asked_date, interview_round) 
                VALUES (?, ?, ?, ?, ?)`;

    db.query(sql, [question_id, company_id, frequency_count || 1, last_asked_date, interview_round || 'online_test'], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Mapping created successfully", mapping_id: result.insertId });
    });
};

// ✅ Get all mappings
exports.getAllMappings = (req, res) => {
    db.query("SELECT * FROM question_company_mapping", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

// ✅ Get mapping by ID
exports.getMappingById = (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM question_company_mapping WHERE mapping_id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "Mapping not found" });
        res.json(result[0]);
    });
};

// ✅ Update mapping
exports.updateMapping = (req, res) => {
    const { id } = req.params;
    const { question_id, company_id, frequency_count, last_asked_date, interview_round } = req.body;

    const sql = `UPDATE question_company_mapping 
                SET question_id = ?, company_id = ?, frequency_count = ?, last_asked_date = ?, interview_round = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE mapping_id = ?`;

    db.query(sql, [question_id, company_id, frequency_count, last_asked_date, interview_round, id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Mapping not found" });
        res.json({ message: "Mapping updated successfully" });
    });
};

// ✅ Delete mapping
exports.deleteMapping = (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM question_company_mapping WHERE mapping_id = ?", [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Mapping not found" });
        res.json({ message: "Mapping deleted successfully" });
    });
};
