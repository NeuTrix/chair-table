//** SEARCHABLE (Company) v-2024.04.30.001 */
// assumes inputs are not carried in as array objects

// todo: make this generic.
//** Create searchable_id for a company */
let inputConfig = input.config();

let company_name = inputConfig.company_name;
let company_website = inputConfig.company_website;
// console.log({company_name, company_website}) //** Inspect */

// ====================== SEARCHABLE NAME =======================
// Function to create a searchable ID, refactored to prevent "--"
const createSearchableId = (names) => {
  const { company_name,company_website } = names;
  const parts = [
    company_name ? company_name.replace(/\s+/g,"-") : '',
    company_website ? company_website : '',  // Only use the first character of company_website if not null or empty
  ].filter(Boolean).join("-").toLowerCase();  // Filter out empty parts to prevent "--" and join them
  console.log({ searchableId: parts });
  return parts;
};

let names = { company_name,company_website }
let searchable_id = createSearchableId(names);
// =============================================

output.set("searchable_id",[searchable_id]);