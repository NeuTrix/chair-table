// set the search table name and find the table

// initiate the config
const inputConfig = input.config();
const table = base.getTable(inputConfig.input_Table_Name);

// deconstruct the fields for the join tables Table_A and Table_B
const {
  Table_A_key,
  Table_A_value,
  Table_B_key,
  Table_B_value,
} = inputConfig;

// find the records for the using the table
const records = await table.selectRecordsAsync(
  { fields: [Table_A_key,Table_B_key] }
);

// console.log({ records }) //** Inspect */

// filter for the record that matches the values for Tables A and B
const foundRecords = records.records.find(record => {
  const record_A = record.getCellValue(Table_A_key)[0];
  const record_B = record.getCellValue(Table_B_key)[0];

  return (
    record_A.id === Table_A_value &&
    record_B.id === Table_B_value
  )
})


// const fields = Object.keys(inputConfig).filter(field => {
//   return !field.includes("input");
// });
// // console.log({fields})//** Inspect */

// // get the records
// let selected = await table.selectRecordsAsync({ fields })
// // console.log({ selected }) //** Inspect */

// // ? find the guests_events (Linked Table)
// const inputs = await asyncCreateInputs(fields);
// const [firstSet,secondSet] = Object.entries(inputs);
// const [first_field,First_ID] = firstSet;
// const [second_field,Second_ID] = secondSet;

// async function asyncCreateInputs(fieldArray) {
//   let fields = {};
//   fieldArray.forEach(field => {
//     const value = inputConfig[field][0];
//     fields[field] = value
//   })

//   return fields;
// }

// // initiate variables
// let Record_ID = null;
// let Action_Status = null;
// // console.log({inputs,firstSet, secondSet}) //** Inspect */

// let foundRecords = selected.records.find(
//   record => {
//     let record_One = record.getCellValue(first_field)[0];
//     let record_Two = record.getCellValue(second_field)[0];
//     console.log({ record_One,record_Two })

//     return (
//       record_One.id === First_ID &&
//       record_Two.id === Second_ID
//     )
//   }
// )
// // console.log({foundRecords}) //** Inspect */

// // Updated || Found
// if (foundRecords) {
//   Record_ID = foundRecords.id;
//   Action_Status = "Found";

//   console.log('Found Record',{ foundRecords });
// }

// // Created
// if (!foundRecords) {
//   let newRecordId = null;
//   try {
//     newRecordId = await table.createRecordAsync({
//       [first_field]: [{ id: First_ID }],
//       [second_field]: [{ id: Second_ID }],
//     });

//     Record_ID = newRecordId;
//     Action_Status = "Created";
//     console.log('New Record Created',{ newRecordId })
//   } catch (error) {
//     throw new Error("Failed to create Join Record")
//   }
// }

// output.set("Record_ID",[Record_ID]);
// output.set("Action_Status",Action_Status);
