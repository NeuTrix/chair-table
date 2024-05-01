//** Google Form SEARCHABLE v-2024.05.01.001 */

//** Create searchable_id FROM Google form */
// Input values are string, not arrays

let inputConfig = input.config();

// @ts-ignore
let first_name = inputConfig.first_name;
// @ts-ignore
let middle_name = inputConfig.middle_name;
// @ts-ignore
let last_name = inputConfig.last_name;
// @ts-ignore
let primary_email = inputConfig.primary_email;
// console.log({primary_email}) //** Inspect */

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

output.set("searchable_id",[searchable_id]);