// Constants and Initial Setup
// => get the table and variables for roles
const inputConfig = input.config();
const { Role_Key,Role_Value,input_Table_Name } = inputConfig;
const table = base.getTable(input_Table_Name);

// @ts-ignore
const Role_ID = Role_Value[0];

//** Select the BASIC Field names */
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
}

//** Find record by Role ID */
const asyncFindRecordByRoleId = (records,Role_ID) => {
  const foundRecords = records.records.find(record => {
    const record_Role = record.getCellValue(Role_Key)[0];
    return record_Role.id === Role_ID;
  })
  return foundRecords;
}

async function processRecords(params) {
  let Record_ID = null;
  let Action_Status = null;
  const { inputConfig,Role_ID,Role_Key } = params;

  // select the fields
  const basicFields = getBasicFields(inputConfig);

  // find the records for basic fields including Role Key 
  const allRecords = await asyncGetRecords([
    ...basicFields,
    Role_Key
  ]);

  // get the records
  const foundRecord = await asyncFindRecordByRoleId(allRecords,Role_ID);

  try {
    if (foundRecord) {
      Record_ID = foundRecord.id;

      //** Update Basic Fields */
      if (basicFields.length > 0) {
        const basicInputs = createInputsFromKeys(basicFields);
        let updates = {};

        // Determine necessary updates based on new data provided
        for (const [field,value] of Object.entries(basicInputs)) {
          if (value && value !== foundRecord.getCellValue(field)) {
            updates[field] = value;
          }
        }
        if (Object.keys(updates).length > 0) {
          await table.updateRecordAsync(foundRecord.id,updates);
        }
      } else {
        //** Found */
      }
      // Action_Status = "Found";
      Action_Status = "Updated";

    } else {
      //** Create */
      // const newRecord = await table.createRecordAsync({
      //   [Role_Key]: [{ id: Role_ID }]
      // });
      Action_Status = "Created";
    }

    return { Record_ID,Action_Status }

  } catch (error) {
    throw new Error(`Dab Nabbit! Something is not working in the Role script: ${error}`);
  }
}

processRecords({ inputConfig,Role_ID,Role_Key }).then(result => {
  if (result) {
    output.set("Record_ID",[result.Record_ID]);
    output.set("Action_Status",[result.Action_Status]);
  } else {
    output.set("Action_Status",["Error"]);
    throw new Error(`No results returned in ${input_Table_Name} script`)
  }
})