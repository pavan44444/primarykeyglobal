const express = require("express");
const router = express.Router();
const controller = require("../controllers/questionCompanyMappingController");

router.post("/", controller.createMapping);
router.get("/", controller.getAllMappings);
router.get("/:id", controller.getMappingById);
router.put("/:id", controller.updateMapping);
router.delete("/:id", controller.deleteMapping);

module.exports = router;
