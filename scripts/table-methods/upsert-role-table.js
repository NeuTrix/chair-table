// Constants and Initial Setup
// => get the table and variables for roles
const inputConfig = input.config();
const table = base.getTable(inputConfig.input_Table_Name);

// get Role ID and Label
const { role_key,role_value } = inputConfig;
const Role_ID = role_value[0];
const Role_Label = role_key;
console.log({ Role_Label,Role_ID }) //** Inspect */

// set authenticator to the role
const hasData = inputConfig.input_validation_field[0];

// => get the fields excluding the ID stuff
// Grab field names from inputs, excluding ID and Table fields
const filteredFieldKeys = Object.keys(inputConfig).filter(key => {
  return (
    !key.includes("ID_") // remove Record Links
    && !key.includes("role")  // remove Roles
    && !key.includes("is_")  // remove logic
    && !key.includes("input") // remove input variables
  )
});

// => make input from the fields, if any
function asyncCreateInputsFromKeys(fieldArray) {
  let inputs = {};
  fieldArray.forEach(key => {
    const value = inputConfig[key][0];
    inputs[key] = value
  })

  return inputs;
}

async function processRecords() {
  const inputs = asyncCreateInputsFromKeys(filteredFieldKeys);

  let Record_ID = null;
  let Action_Status = null;

  try {
    // find the records
    const records = await table.selectRecordsAsync(
      {
        fields: [
          ...filteredFieldKeys,
          Role_Label,
        ]
      }
    );

    // get record based on value of a Linked Record cell
    const foundRecord = records.records.find(
      item => {
        return (item.getCellValue(Role_Label)[0].id === Role_ID)
      }
    );

    if (foundRecord) {
      //** Found Record */
      Record_ID = foundRecord.id;
      Action_Status = "Found";
    } else {
      //** Create Record */
      const newRecordId = await table.createRecordAsync(
        { [Role_Label]: [{ id: Role_ID }] }
      );
      console.log({ newRecordId })//////////
      Record_ID = newRecordId;
      Action_Status = "Created";
    }
    console.log({ Record_ID,Action_Status })////////////////
    return { Record_ID,Action_Status }

  } catch (error) {
    throw new Error(`Error processing records: ${error}`);
  }
}

// //** Execute the function and handle outputs */
await processRecords().then(result => {
  if (result) {
    output.set("Record_ID",[result.Record_ID][0]);
    output.set("Action_Status",[result.Action_Status]);
  } else {
    output.set("Action_Status",["Error"]);
    throw new Error("No results returned in People script")
  }
})
