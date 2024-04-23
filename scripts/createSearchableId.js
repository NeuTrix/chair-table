//** Create searchable_id */

let inputConfig = input.config();

let first_name = inputConfig.first_name[0];
let middle_name = inputConfig.middle_name[0];
let last_name = inputConfig.last_name[0];
let primary_email = inputConfig.primary_email[0];

// ====================== SEARCHABLE NAME =======================
// Function to create a searchable ID, refactored to prevent "--"
const createSearchableId = (names) => {
  const { first_name,middle_name,last_name,primary_email } = names;
  const parts = [
    last_name.replace(/\s+/g,"-"),
    first_name.replace(/\s+/g,"-"),
    middle_name ? middle_name[0] : '',  // Only use the first character of middle_name if not null or empty
    primary_email
  ].filter(Boolean).join("-").toLowerCase();  // Filter out empty parts to prevent "--" and join them
  console.log({ searchableId: parts });
  return parts;
};

let names = { first_name,middle_name,last_name,primary_email }
let searchable_id = createSearchableId(names);
// =============================================

output.set("firstName",[first_name]);
output.set("middleName",[middle_name]);
output.set("lastName",[last_name]);
output.set("searchable_id",[searchable_id]);
