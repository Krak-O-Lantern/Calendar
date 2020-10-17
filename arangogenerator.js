/* eslint-disable no-console */
const mongoose = require('mongoose');
const faker = require('faker');
const fs = require('fs');
const { argv } = require('yargs');

const lines = argv.lines || 1000000;
const filename = argv.output || 'reservations.jsonl';
const stream = fs.createWriteStream(filename);
const { Month } = require('./database-mongodb/index.js');


// leading 4 months, #days in month, scable if needed
const months = {
  October: 31,
  November: 30,
  December: 31,
  January: 31,
};

// listing type helper
const listingTypes = [
  'Entire house',
  'Entire apartment',
  'Entire cabin',
  'Entire chalet',
  'Entire cottage',
  'Entire treehouse',
  'Entire condominium',
  'Entire guest suite',
  'Entire townhouse',
  'Entire guesthouse',
  'Entire house',
  'Entire tiny house',
  'Hotel room',
  'Private room',
  'Shared room',
];

// helper function for random seed data (inclusive)
const randomInt = (min, max) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1) + Math.ceil(min));

// container for 100 listing objects
const listings = [];
let monthsResult = [];

// child seeding logic to create subdocuments for each month (3)
const seedMonths = () => {
  monthsResult = [];
  const monthsArr = Object.entries(months);

  monthsArr.forEach(([month, numDays]) => {
    const listingIsAvailable = [];
    while (listingIsAvailable.length < numDays) {
      let nightsInARow = randomInt(4, 10);
      const value = randomInt(1, 2) === 1 ? 1 : 0;
      while (nightsInARow > 0) {
        listingIsAvailable.push(value);
        nightsInARow -= 1;
        if (listingIsAvailable.length === numDays) {
          break;
        }
      }
    }
    monthsResult.push({
      name: month,
      days: listingIsAvailable,
    });
  });
  monthsResult = monthsResult.map((month) => new Month(month));
};

// main seeding logic to create new documents in Listing collection
const createPost = (line) => {
  seedMonths();
  const listing = {
    listing_id: line,
    price: randomInt(100, 900),
    rating: randomInt(25, 50) / 10,
    reviews_count: randomInt(20, 1000),
    guest_limit: randomInt(2, 6) * 2,
    guest_included: randomInt(1, 2) * 2,
    guest_extra_charge: randomInt(10, 20),
    cleaning_fee: randomInt(10, 35) * 10,
    service_fee: randomInt(20, 40),
    taxes: randomInt(15, 30),
    bedrooms: randomInt(0, 5),
    beds: randomInt(1, 5),
    baths: randomInt(1, 5),
    listing_type: listingTypes[randomInt(0, 14)],
    host: faker.name.firstName(),
    availability: monthsResult,
  }
  if (line % 100000 === 0) {
    console.log(`${Math.round((((line / lines)) * 100))}% of reservations.jsonl`);
  }
  return `${JSON.stringify(listing)}\n`
};

const startWriting = (writeStream, encoding, done) => {
  let i = lines
  function writing() {
    let canWrite = true
    do {
      i--
      let post = createPost(i)
      //check if i === 0 so we would write and call `done`
      if (i === 0) {
        // we are done so fire callback
        writeStream.write(post, encoding, done)
      } else {
        // we are not done so don't fire callback
        canWrite = writeStream.write(post, encoding)
      }
      //else call write and continue looping
    } while (i > 0 && canWrite)
    if (i > 0 && !canWrite) {
      //our buffer for stream filled and need to wait for drain
      // Write some more once it drains.
      writeStream.once('drain', writing);
    }
  }
  writing()
}

//write our `header` line before we invoke the loop
stream.write('utf-8 \n')
//invoke startWriting and pass callback
startWriting(stream, 'utf-8', () => {
  stream.end()
})