
// Name Splitter
// this function takes a full name as a string and returns an object with the first, middle, and last names as separate properties.  The middle name will be an empty string if it is not provided.

function nameSplitter(name) {
  var nameArray = name.split(' ');
  var firstName = nameArray[0];
  var lastName = nameArray[nameArray.length - 1];
  var middleName = nameArray.slice(1,nameArray.length - 1).join(' ');
  return { firstName,middleName,lastName };
}

// *** test ***
// Expected output: { firstName: 'John', middleName: 'Doe', lastName: 'Smith-Jones' }
// let name = "John Doe Smith-Jones"
// let name1 = "John Doe Smith Jones"

// let result = nameSplitter(name);
// let result1 = nameSplitter(name1);

// console.log({result, result1});
