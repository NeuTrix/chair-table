//** Entity v.2024.10.07.000 */
// Direct creation of a PEOPLE record in the PEOPLE
// No use of Recipe Data Summary or Checklist

const inputConfig = input.config();
const table = base.getTable(inputConfig.input_Table_Name);
const hasData = inputConfig.input_Validation_Field[0];

// Grab field names from inputs, excluding ID and Table fields
const fields = Object.keys(inputConfig).filter(key => {
  return !key.includes("ID_") && !key.includes("input")
})

function createInputs(fieldArray) {
  let fields = {};

  fieldArray.forEach(field => {
    fields[field] = inputConfig[field];
  })

  return fields;
}

async function asyncProcessRecords() {
  const inputs = createInputs(fields);
  const { searchable_id } = inputs;

  let Record_ID = null;
  let Action_Status = null;

  try {
    if (!hasData) {
      Action_Status = "Error";
      throw new Error("Missing information");
    };

    const records = await table.selectRecordsAsync({ fields });

    const foundRecord = records.records.find(
      record => record.getCellValueAsString("searchable_id") === searchable_id
    );

    if (foundRecord) {
      Record_ID = foundRecord.id;

      let updates = {}; // console.log({updates})

      // Determine necessary updates based on new data provided
      for (const [field,value] of Object.entries(inputs)) {
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
      const newRecordId = await table.createRecordAsync({ ...inputs });
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