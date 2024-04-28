// set the search table name and find the table
// initiate the config
const inputConfig = input.config();
const table = base.getTable(inputConfig.input_Table_Name);

const fields = Object.keys(inputConfig).filter(field => {
  return (
    !field.includes("input")
    && !field.includes("ID_Recipe_Data_Summary")
  )
});
console.log({ fields })//** Inspect */

// get the records
let selected = await table.selectRecordsAsync({ fields })
console.log({ selected }) //** Inspect */

async function asyncCreateInputs(fieldArray) {
  try {
    let fields = {};
    fieldArray.forEach(field => {
      const value = inputConfig[field][0];
      fields[field] = value
    })

    return fields;

  } catch (error) {
    throw new Error(`Dab Nabbit! Something is not working in the ${input_Table_Name} script: ${error}`);
  }
}

// ? find the guests_events (Linked Table)
const inputs = await asyncCreateInputs(fields);
const [firstSet,secondSet] = Object.entries(inputs);
const [first_field,First_ID] = firstSet;
const [second_field,Second_ID] = secondSet;

// initiate variables
let Record_ID = null;
let Action_Status = null;
// console.log({inputs,firstSet, secondSet}) //** Inspect */

// todo: Need to cover edge cases where fields are not there for ID
// similar to value && value or if inputs > 0
let foundRecords = selected.records.find(
  record => {
    // Investigate why this differs
    let record_One = record.getCellValue(first_field)[0];
    let record_Two = record.getCellValue(second_field)[0];
    console.log({ record_One,record_Two,First_ID,Second_ID }) //** Inspect */

    return (
      record_One.id === First_ID &&
      record_Two.id === Second_ID
    )
  }
)
console.log({ foundRecords }) //** Inspect */

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
output.set("Action_Status",[Action_Status]);

//==================================================================
//** Update Single Select */
// 1) Provide this at the end of the file...
// 2) Add ID_Recipe_Data_Summary to the inputConfig and filter it from Fields fns
// 3) update 'asyncProcessRecords' name
// 4) ensure Table name is aligned in ID_Recipe_Data_Summary

//** Execute the function and handle outputs */
// @ts-ignore
// const { Record_ID,Action_Status } = await asyncProcessRecords();

//** Set Outputs */
// output.set("Record_ID",[Record_ID]);
// output.set("Action_Status",[Action_Status]);

//** Update Checklist Status */
const checklist = base.getTable("Recipe_Checklist");
// @ts-ignore
const { input_Table_Name,ID_Recipe_Data_Summary } = inputConfig;

const recipeRecord = await checklist.selectRecordAsync(
  ID_Recipe_Data_Summary,
  { fields: [input_Table_Name] }
);

recipeRecord && await checklist.updateRecordAsync(recipeRecord.id,
  { [input_Table_Name]: { name: `${Action_Status}` } }
)
