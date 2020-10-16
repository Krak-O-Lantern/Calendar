/* eslint-disable no-console */
const mongoose = require('mongoose');
const faker = require('faker');
const fs = require('fs');
const { argv } = require('yargs');

const lines = argv.lines || 1000000;
const filename = argv.output || 'reservations.csv';
const stream = fs.createWriteStream(filename);


// listing type helper
const months = {
  "October": 31,
  "November": 30,
  "December": 31,
  "January": 31,
};

// listing type helper
const listingTypes = [
  "Entire house",
  "Entire apartment",
  "Entire cabin",
  "Entire chalet",
  "Entire cottage",
  "Entire treehouse",
  "Entire condominium",
  "Entire guest suite",
  "Entire townhouse",
  "Entire guesthouse",
  "Entire house",
  "Entire tiny house",
  "Hotel room",
  "Private room",
  "Shared room",
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
    monthsResult.push(
    `"${month}"`, listingIsAvailable, "/"
    );
  });
  return monthsResult
};

// main seeding logic to create new documents in Listing collection
const createPost = (line) => {
      let listing_id = line;
      let price = randomInt(100, 900);
      let rating = randomInt(25, 50) / 10;
      let reviews_count = randomInt(20, 1000);
      let guest_limit = randomInt(2, 6) * 2;
      let guest_included = randomInt(1, 2) * 2;
      let guest_extra_charge = randomInt(10, 20);
      let cleaning_fee = randomInt(10, 35) * 10;
      let service_fee = randomInt(20, 40);
      let taxes = randomInt(15, 30);
      let bedrooms =randomInt(0, 5);
      let beds =randomInt(1, 5);
      let baths =randomInt(1, 5);
      let listing_type = listingTypes[randomInt(0, 14)];
      let host = faker.name.firstName();
      let dates = seedMonths();
  return `${listing_id}|${price}|${rating}|${reviews_count}|${guest_limit}|${guest_included}|${guest_extra_charge}|${cleaning_fee}|${service_fee}|${taxes}|${bedrooms}|${beds}|${baths}|${listing_type}|${host}|"{${dates}}"\n`
};

const startWriting = (writeStream, encoding, done) => {
  let i = lines
  function writing(){
    let canWrite = true
    do {
      i--
      let post = createPost(i)
      //check if i === 0 so we would write and call `done`
      if(i === 0){
        // we are done so fire callback
        writeStream.write(post, encoding, done)
      }else{
        // we are not done so don't fire callback
        writeStream.write(post, encoding)
      }
      //else call write and continue looping
    } while(i > 0 && canWrite)
    if(i > 0 && !canWrite){
      //our buffer for stream filled and need to wait for drain
      // Write some more once it drains.
      writeStream.once('drain', writing);
    }
  }
  writing()
}

//write our `header` line before we invoke the loop
stream.write(`listing_id|price|rating|reviews_count|guest_limit|guest_included|guest_extra_charge|cleaning_fee|service_fee|taxes|bedrooms|bed|baths|listing_type|host|dates\n`, 'utf-8')
//invoke startWriting and pass callback
startWriting(stream, 'utf-8', () => {
  stream.end()
})