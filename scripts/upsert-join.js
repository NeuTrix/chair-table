// set the search table name and find the table

// initiate the config
const inputConfig = input.config();
const table = base.getTable(inputConfig.input_Table_Name);

const fields = Object.keys(inputConfig).filter(field => {
  return !field.includes("input");
});
// console.log({fields})//** Inspect */

// get the records
let selected = await table.selectRecordsAsync({ fields })
// console.log({ selected }) //** Inspect */

// ? find the guests_events (Linked Table)
const inputs = await createInputs(fields);
const [firstSet,secondSet] = Object.entries(inputs);
const [first_field,First_ID] = firstSet;
const [second_field,Second_ID] = secondSet;

async function createInputs(fieldArray) {
  let fields = {};
  fieldArray.forEach(field => {
    const value = inputConfig[field][0];
    fields[field] = value
  })

  return fields;
}

// initiate variables
let Record_ID = null;
let Action_Status = null;
// console.log({inputs,firstSet, secondSet}) //** Inspect */

let foundRecords = selected.records.find(
  record => {
    let record_One = record.getCellValue(first_field)[0];
    let record_Two = record.getCellValue(second_field)[0];
    console.log({ record_One,record_Two })

    return (
      record_One.id === First_ID &&
      record_Two.id === Second_ID
    )
  }
)
// console.log({foundRecords}) //** Inspect */

// Updated || Found
if (foundRecords) {
  Record_ID = foundRecords.id;
  Action_Status = "Found";

  console.log('Found Record',{ foundRecords });
}

// Created
if (!foundRecords) {
  let newRecordId = null;
  try {
    newRecordId = await table.createRecordAsync({
      [first_field]: [{ id: First_ID }],
      [second_field]: [{ id: Second_ID }],
    });

    Record_ID = newRecordId;
    Action_Status = "Created";
    console.log('New Record Created',{ newRecordId })
  } catch (error) {
    throw new Error("Faild to create Join Record")
  }
}

output.set("Record_ID",[Record_ID]);
output.set("Action_Status",Action_Status);
