const Trip = require("../models/Trip");

exports.createTrip = async (req, res) => {
  const { destination, startDate, endDate, budget, people, itinerary, notes } = req.body;

  if (!destination || !startDate || !endDate || !budget) {
    return res.status(400).json({ message: "Destination, travel dates, and budget are required." });
  }

  const trip = await Trip.create({
    user: req.user._id,
    destination,
    startDate,
    endDate,
    budget,
    people: people || 1,
    itinerary: itinerary || [],
    notes: notes || "",
  });

  res.status(201).json(trip);
};

exports.getUserTrips = async (req, res) => {
  const trips = await Trip.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(trips);
};

exports.getTripById = async (req, res) => {
  const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
  if (!trip) {
    return res.status(404).json({ message: "Trip not found." });
  }
  res.json(trip);
};

exports.updateTrip = async (req, res) => {
  const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
  if (!trip) {
    return res.status(404).json({ message: "Trip not found." });
  }

  const updates = ["destination", "startDate", "endDate", "budget", "people", "itinerary", "notes"];
  updates.forEach((field) => {
    if (req.body[field] !== undefined) {
      trip[field] = req.body[field];
    }
  });

  await trip.save();
  res.json(trip);
};

exports.deleteTrip = async (req, res) => {
  const trip = await Trip.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!trip) {
    return res.status(404).json({ message: "Trip not found." });
  }
  res.json({ message: "Trip deleted." });
};
