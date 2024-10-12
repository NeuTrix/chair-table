//** upsert-entity-table-direct.js v.04.00.01 */
// 2024-10-11

const inputConfig = input.config();
const table = base.getTable(inputConfig.input_Table_Name);
const hasData = inputConfig.input_Validation_Field[0];

// TODO: solve for null record Value cases

//** Need to add this to cover ID_ cases */
function createInputs(nonInputFields) {
  const fields = {};
  nonInputFields.forEach(field => {
    if (field.includes("ID_")) {
      fields[field] = [{ id: inputConfig[field]?.[0] }];
    } else {
      fields[field] = inputConfig[field]?.[0];
    }
  });

  return fields;
}

// Grab field names from inputs, excluding ID and Table fields

async function asyncProcessRecords() {
  const fields = Object.keys(inputConfig).filter(key => !key.includes("input"));
  const tableInputs = createInputs(fields);
  const { searchable_id } = tableInputs;

  let Record_ID = null;
  let Action_Status = null;

  try {
    if (!hasData) {
      Action_Status = "Error";
      console.log("No data to Process")
      return { Record_ID,Action_Status }
    };

    // collect records from the table using the fields
    const records = await table.selectRecordsAsync({ fields });

    // find the record based on the searchable_id
    const foundRecord = records.records.find(
      record => record.getCellValueAsString("searchable_id") === searchable_id
    );
    // console.log({ records,foundRecord }) //** Inspect */

    if (foundRecord) {
      Record_ID = foundRecord.id;

      let updates = {}; // console.log({updates})

      // Determine necessary updates based on new data provided
      for (const [field,value] of Object.entries(tableInputs)) {
        if (value && value !== foundRecord.getCellValue(field)) {
          updates[field] = value;
        }
      }

      //** Update Record */
      if (Object.keys(updates).length > 0) {
        await table.updateRecordAsync(foundRecord.id,updates);
        Action_Status = "Updated";
      } else {
        //** Found Record */
        Action_Status = "Found";
      }
    } else if (hasData) {
      //** Create Record */
      const newRecordId = await table.createRecordAsync({ ...tableInputs });
      Record_ID = newRecordId;
      Action_Status = "Created";
    }

    return { Record_ID,Action_Status }
  } catch (error) {
    throw new Error(`Error processing records: ${error}`);
  }
}

//==================================================================
//** Execute the function and handle outputs */
// @ts-ignore
const { Record_ID,Action_Status } = await asyncProcessRecords();

//** Set Outputs */
output.set("Record_ID",[Record_ID]);
output.set("Action_Status",[Action_Status]);