//** nameSplitter function */ 
// accepts raw inputs form a table and returns as API viable arrays
let inputConfig = input.config();
let primary_email = inputConfig.primary_email;
let full_name = inputConfig.full_name;

// splits a full name string into first, middle, and last
function nameSplitter(name) {
  let nameArray = name
    .split(' ')
    .filter(name => name !== ""); // remove extra spaces
  let first_name = nameArray[0].trim();
  let last_name = nameArray[nameArray.length - 1].trim();
  let middle_name = nameArray
    .slice(1,nameArray.length - 1)
    .join(' ')

  return { first_name,middle_name,last_name };
}

let result = nameSplitter(full_name);
let { first_name,last_name,middle_name } = result;

// deliver output as [] items, as does the API
output.set("full_name",[full_name],);
output.set("first_name",[first_name],);
output.set("middle_name",[middle_name],);
output.set("last_name",[last_name],);
output.set("primary_email",[primary_email],);
