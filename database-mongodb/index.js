/* eslint-disable no-console */
const mongoose = require('mongoose');

// subdocument child schema for availability dates (by month)
const monthSchema = new mongoose.Schema({
  name: String,
  days: Array,
});

const Month = mongoose.model('Month', monthSchema);

// parent schema
const listingSchema = new mongoose.Schema({
  listing_id: Number,
  price: Number,
  rating: Number,
  reviews_count: Number,
  guest_limit: Number,
  guest_included: Number,
  guest_extra_charge: Number,
  cleaning_fee: Number,
  service_fee: Number,
  taxes: Number,
  bedrooms: Number,
  beds: Number,
  baths: Number,
  listing_type: String,
  host: String,
  availability: Array,
});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = { Listing, Month };
