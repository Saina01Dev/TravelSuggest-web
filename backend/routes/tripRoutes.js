const express = require("express");
const router = express.Router();
const tripController = require("../controllers/tripController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);
router.post("/create", tripController.createTrip);
router.get("/user", tripController.getUserTrips);
router.get("/:id", tripController.getTripById);
router.put("/:id", tripController.updateTrip);
router.delete("/:id", tripController.deleteTrip);

module.exports = router;
