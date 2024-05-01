//** Generic SEARCHABLE v-2024.05.01.001 */

//** Create searchable_id FROM Google form */
// Input values are string, not arrays

let inputConfig = input.config();

// @ts-ignore
let value_A = inputConfig[value_A];
// @ts-ignore
let value_B = inputConfig[value_B];
// @ts-ignore
let value_C = inputConfig[value_C];
// @ts-ignore
let value_D = inputConfig[value_D];
// console.log({value_D}) //** Inspect */

// ====================== SEARCHABLE NAME =======================
// Function to create a searchable ID, refactored to prevent "--"
const createSearchableId = (values) => {
  const { value_A,value_B,value_C,value_D } = values;
  const parts = [
    value_A ? value_A.replace(/\s+/g,"-") : '',
    value_B ? value_B.replace(/\s+/g,"-") : '',
    value_C ? value_C.replace(/\s+/g,"-") : '',
    value_D ? value_D.replace(/\s+/g,"-") : '',
    // Filter out empty parts to prevent "--" and join them
  ].filter(Boolean).join("-").toLowerCase();
  console.log({ searchableId: parts }); //** Inspect */
  return parts;
};

let values = { value_A,value_B,value_C,value_D }
let searchable_id = createSearchableId(values);
// =============================================

output.set("searchable_id",[searchable_id]);