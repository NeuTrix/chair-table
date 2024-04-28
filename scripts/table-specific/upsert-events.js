// Constants and Initial Setup
const inputConfig = input.config();
const table = base.getTable(inputConfig.input_Table_Name);
const hasData = inputConfig.input_Validation_Field[0];

// Grab field names from inputs, excluding ID and Table fields
const fields = Object.keys(inputConfig).filter(key => {
  return (
    key.substring(0,3) !== "ID_" &&
    !key.includes("input")
  )
})
// console.log({fields}) // Inspect fields

// Grab Record-Link-IDs from inputs, excluding ID and Table fields
const recordLinkNames = Object.keys(inputConfig).filter(key => {
  return (
    key.substring(0,3) === "ID_"
    && !key.includes("input")
    && !key.includes("ID_Recipe_Data_Summary")
  )
})
console.log({ recordLinkNames }) // Inspect fields

function createInputs(fieldArray) {
  let fields = {};
  fieldArray.forEach(field => {
    const value = inputConfig[field][0];
    fields[field] = value
    // console.log({field, value}) // Inspect field and value

    // ensure clean searchable_id
    if (field === "searchable_id") {
      fields[field] = value ? value.trim() : null;
      //** Need to fix Zapier to lowercase, then use... */
      fields[field] = value ? value.trim().toLowerCase() : null;
    }
  })

  return fields;
}

//** Attach the source of normative data */
async function addNormativeDataLink(Record_ID,recordLinkNames) {
  recordLinkNames.forEach(name => {
    table.updateRecordAsync(Record_ID,{
      [name]: [{ id: inputConfig[name][0] }]
    });
  })
}

async function asyncProcessRecords() {
  const inputs = createInputs(fields);
  const { searchable_id } = inputs;

  let Record_ID = null;
  let Action_Status = null;

  try {
    const records = await table.selectRecordsAsync({ fields });
    const foundRecord = records.records.find(
      record => record.getCellValueAsString("searchable_id") === searchable_id
    );

    if (!hasData) {
      Action_Status = "Error";
      throw new Error("Missing information");
    };

    if (foundRecord) {
      let updates = {};
      Record_ID = foundRecord.id;

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

    await addNormativeDataLink(Record_ID,recordLinkNames);

    return { Record_ID,Action_Status }
  } catch (error) {
    Action_Status = "Created";
    throw new Error(`Error processing records: ${error}`);
  }
}

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
  { [input_Table_Name]: { name: "Action_Status" } }
)

