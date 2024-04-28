// create a function to a record's single select field value in airtable
// ========================================================

//** Update Single Select */
// 1) Provide this at the end of the file...
// 2) Add ID_Recipe_Data_Summary to the inputConfig and filter it from Fields fns

//** Execute the function and handle outputs */
// @ts-ignore
const { Record_ID,Action_Status } = await asyncProcessRecords();

//** Set Outputs */
output.set("Record_ID",[Record_ID]);
output.set("Action_Status",[Action_Status]);

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


// ========================================================

//** Get Linked Inputs from keys */
function createLinkedInputsFromKeys(fieldArray) {
  let inputs = {};
  fieldArray.forEach(key => {
    const value = inputConfig[key];
    inputs[key] = value
  })
  return inputs;
}

// ========================================================

//** Select the Field names */
const getBasicFields = (config) => {
  const fields = Object.keys(config).filter(field => {
    return (
      !field.includes("ID_")
      && !field.includes("input")
      && !field.includes("Role")
    )
  });
  return fields; // add Role Key to output
}

// ========================================================

//** Get linked Fields */
const getLinkedFields = (config) => {
  const fields = Object.keys(config).filter(field => {
    return (
      field.includes("ID_")
    )
  });
  return fields; // add Role Key to output
}

// ========================================================

//** Create inputs object from base fields */
function createInputsFromKeys(fieldArray) {
  let inputs = {};
  fieldArray.forEach(key => {
    const value = inputConfig[key][0];
    inputs[key] = value
  })
  return inputs;
}

//** Get the records */
const asyncGetRecords = async (fieldArray) => {
  const records = await table.selectRecordsAsync(
    { fields: fieldArray }
  );
  return records;
}\

// ========================================================

//** Find record by Role ID */
const asyncFindRecordByRoleId = (records,Role_ID) => {
  const foundRecords = records.records.find(record => {
    const record_Role = record.getCellValue(Role_Key)[0];
    return record_Role.id === Role_ID;
  })
  return foundRecords;
}
