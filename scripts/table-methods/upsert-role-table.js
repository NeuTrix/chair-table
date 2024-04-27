// Constants and Initial Setup
// => get the table and variables for roles
const inputConfig = input.config();
const table = base.getTable(inputConfig.input_Table_Name);

// @ts-ignore
const { Role_Key,Role_Value } = inputConfig;
const Role_ID = Role_Value[0];
// console.log({ Role_Key,Role_ID, Role_Value}) //** Inspect */

// create list of field ids excluding the Roles
const getFilteredFields = (config) => {
  const fields = Object.keys(config).filter(field => {
    return (
      !field.includes("Role") // excludes Role fields
      && !field.includes("input") // excludes input fields
      && !field.includes("ID_") // excludes linked fields
      && !field.includes("is_") // excludes logic fields
    );
  });
  return fields;
}
const filteredFields = getFilteredFields(inputConfig);
console.log({ filteredFields }) //** Inspect */

const getFilteredRecordLinks = (config) => {
  const recordLinks = Object.keys(config).filter(field => {
    return (
      field.includes("ID_") // includes linked fields
    );
  });
  return recordLinks;
}
const filteredRecordLinks = getFilteredRecordLinks(inputConfig);
console.log({ filteredRecordLinks }) //** Inspect */

// const getSelectedRecords = async (inputConfig) => {
//   const records = await table.selectRecordsAsync(
//     { fields: filteredFields }
//   );
//   return records;
// }

// // find the records for a linked record
// const records = await table.selectRecordsAsync(
//   { fields: [Role_Key] }
// );

// // select record based on the Role_Value  
// const foundRecords = records.records.find(record => {
//   const record_Role = record.getCellValue(Role_Key)[0];
//   return record_Role.id === Role_ID;
// })
// // console.log({ records, foundRecords }) //** Inspect */

// // update base field filtered array
// function asyncCreateInputsFromKeys(fieldArray) {
//   let inputs = {};
//   fieldArray.forEach(key => {
//     const value = inputConfig[key][0];
//     inputs[key] = value

//     if (key === "searchable_id") {
//       inputs[key] = value ? value.trim().toLowerCase() : null;
//     }
//   })

//   return inputs;
// }
// // ======================================================= 
// async function asyncProcessRecords() {
//   let Record_ID = null;
//   let Action_Status = null;

//   try {
//     if (foundRecords) {


//       // update the link records
//       const recordID = foundRecords.id;
//       const updatedRecord = await table.updateRecordAsync(recordID,{
//         [Role_Key]: [{ id: Role_ID }]
//       });

//     } else {
//       // create a new record
//       const newRecord = await table.createRecordAsync({
//         [Role_Key]: [{ id: Role_ID }]
//       });
//       // console.log({ newRecord }) //** Inspect */

//     }

//     return { Record_ID,Action_Status }
//   } catch (error) {


//   }
// }