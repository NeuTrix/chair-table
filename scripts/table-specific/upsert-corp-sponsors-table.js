// Constants and Initial Setup
// => get the table and variables for roles
const inputConfig = input.config();
//@ts-ignore
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
      && !field.includes("ID_Recipe_Data_Summary")
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

async function asyncProcessRecords(params) {
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
    throw new Error(`Dab Nabbit! Something is not working in the ${input_Table_Name} script: ${error}`);
  }
}

//==================================================================
//** Update Single Select */
// 1) Provide this at the end of the file...
// 2) Add ID_Recipe_Data_Summary to the inputConfig and filter it from Fields fns
// 3) upate 'asyncProcessRecords' name
// 4) ensure Table name is aligned in ID_Recipe_Data_Summary

//** Execute the function and handle outputs */
// @ts-ignore
const { Record_ID,Action_Status } = await asyncProcessRecords({ inputConfig,Role_ID,Role_Key });

//** Set Outputs */
output.set("Record_ID",[Record_ID]);
output.set("Action_Status",[Action_Status]);

//** Update Checklist Status */
const checklist = base.getTable("Recipe_Checklist");
// @ts-ignore
const { ID_Recipe_Data_Summary } = inputConfig;

const recipeRecord = await checklist.selectRecordAsync(
  ID_Recipe_Data_Summary,
  { fields: [input_Table_Name] }
);

recipeRecord && await checklist.updateRecordAsync(recipeRecord.id,
  { [input_Table_Name]: { name: `${Action_Status}` } }
)

