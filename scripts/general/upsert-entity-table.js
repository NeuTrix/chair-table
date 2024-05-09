//** ENTITY v.2024.05.09.001 */
// Add back ability to add ID Fields

//** Requires 
/* input_table_name,
/* input_validation_field,
/* searchable_id,
/* ID_Recipe_Data_Summary 
/* ...fields,
*/

const inputConfig = input.config();
const table = base.getTable(inputConfig.input_table_name);

// Revised function to create table data more directly
function createBaseData(fieldArray) {
  const fields = {};
  fieldArray.forEach(field => fields[field] = inputConfig[field]?.[0]);
  return fields;
}

function createIdData(fieldArray) {
  const fields = {};
  fieldArray.forEach(field => fields[field] = [{ id: inputConfig[field]?.[0] }]);
  return fields;
}

// Main async function to process records
async function asyncProcessRecords(inputConfig) {

  const baseFields = Object.keys(inputConfig).filter(key => !key.includes("ID_") && !key.includes("input"));
  console.log({ baseFields }) //** Inspect */

  const idFields = Object.keys(inputConfig).filter(key => key.includes("ID_") && !key.includes("ID_Recipe_Data_Summary"));
  console.log({ idFields }) //** Inspect */

  if (!inputConfig.input_validation_field[0]) {
    throw new Error("Missing information: Input validation failed.");
  }

  const baseData = createBaseData(baseFields);
  const idData = createIdData(idFields);
  const tableData = { ...baseData,...idData };
  console.log({ tableData,baseData,idData }) //** Inspect */

  const records = await table.selectRecordsAsync({ fields: [...baseFields,...idFields] });
  const foundRecord = records.records.find(record => record.getCellValueAsString("searchable_id") === baseData.searchable_id);
  console.log({ records,foundRecord }) //** Inspect */

  let actionStatus = foundRecord ? "Found" : "Created";
  let recordID = foundRecord?.id;

  if (foundRecord) {
    // update from base fields
    const updates = Object.entries(tableData).reduce((acc,[field,value]) => {
      if (value && value !== foundRecord.getCellValue(field)) acc[field] = value;
      return acc;
    },{});

    if (Object.keys(updates).length > 0) { // or for base updates
      await table.updateRecordAsync(foundRecord.id,updates);
      actionStatus = "Updated";
    }

  } else {
    recordID = await table.createRecordAsync(baseData);
  }

  return { Record_ID: recordID,Action_Status: actionStatus };
}

// Execution block
(async () => {
  let actionStatus = null; // for updating checklist status

  try {
    const { Record_ID,Action_Status } = await asyncProcessRecords(inputConfig);

    actionStatus = Action_Status;
    output.set("Record_ID",[Record_ID]);
    output.set("Action_Status",[Action_Status]);
  } catch (error) {
    console.error(`Error processing records: ${error}`);

    actionStatus = "Error";
    output.set("Record_ID",["Error"]);
    output.set("Action_Status",["Error"]);
  }

  //=================================================
  /** Update Checklist Status */
  const checklist = base.getTable("Recipe_Checklist");
  // @ts-ignore
  const { input_table_name,ID_Recipe_Data_Summary } = inputConfig;

  const recipeRecord = await checklist.selectRecordAsync(
    ID_Recipe_Data_Summary,
    { fields: [input_table_name] }
  );

  recipeRecord && await checklist.updateRecordAsync(recipeRecord.id,
    { [input_table_name]: { name: `${actionStatus}` } }
  )

})();
