DROP DATABASE IF EXISTS reservations;
CREATE DATABASE reservations;

\c reservations

CREATE TABLE IF NOT EXISTS availability (
  listing_id INT PRIMARY KEY , price INT NOT NULL, rating VARCHAR(6) NOT NULL, reviews_count INT NOT NULL, guest_limit INT NOT NULL, guest_included INT NOT NULL,guest_extra_charge INT NOT NULL, cleaning_fee INT NOT NULL, service_fee INT NOT NULL, taxes INT NOT NULL, bedrooms INT NOT NULL, beds INT NOT NULL, baths INT NOT NULL, listing_type VARCHAR(255), host VARCHAR(255), dates VARCHAR(1000) ARRAY NOT NULL
)
