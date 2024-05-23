//** ENTITY v-3.1.0 */
// updates input name Checklist ID

//** Requires 
/* input_table_name,
/* searchable_id,
/* ID_Recipe_Checklist 
/* ...fields,
*/

const inputConfig = input.config();
const table = base.getTable(inputConfig.input_table_name);

// TODO: solve for null record Value cases
function createTableData(fieldArray) {
  const fields = {};
  fieldArray.forEach(field => {
    if (field.includes("ID_")) {
      fields[field] = [{ id: inputConfig[field]?.[0] }];
    } else {
      fields[field] = inputConfig[field]?.[0];
    }
  });
  return fields;
}

// Main async function to process records
async function asyncProcessRecords(inputConfig) {
  const fields = Object.keys(inputConfig).filter(key => !key.includes("input") && !key.includes("ID_Recipe_Checklist"));
  // console.log({ fields }) //** Inspect */

  const tableData = createTableData(fields);
  // console.log({ tableData }) //** Inspect */

  const records = await table.selectRecordsAsync({ fields });
  const foundRecord = records.records.find(record => record.getCellValueAsString("searchable_id") === tableData.searchable_id);
  // console.log({ records,foundRecord }) //** Inspect */

  let actionStatus = foundRecord ? "Found" : "Created";
  let recordID = foundRecord?.id;

  if (foundRecord) {
    const updates = Object.entries(tableData).reduce((acc,[field,value]) => {
      const recordValue = foundRecord.getCellValue(field);

      if (value) {
        const shouldUpdateField = !recordValue || (field.includes("ID_")
          ? value[0].id !== recordValue[0].id
          : value !== recordValue);

        if (shouldUpdateField) {
          acc[field] = value;
        }
      }

      return acc;
    },{});
    // console.log({ id: foundRecord.id, updates }) //** Inspect */

    if (Object.keys(updates).length > 0) { // or for base updates
      await table.updateRecordAsync(foundRecord.id,updates);
      actionStatus = "Updated";
    }

  } else {
    recordID = await table.createRecordAsync(tableData);
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
  const { input_table_name,ID_Recipe_Checklist } = inputConfig;

  const recipeRecord = await checklist.selectRecordAsync(
    ID_Recipe_Checklist,
    { fields: [input_table_name] }
  );

  recipeRecord && await checklist.updateRecordAsync(recipeRecord.id,
    { [input_table_name]: { name: `${actionStatus}` } }
  )

})();
