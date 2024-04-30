// Constants and Initial Setup
//** Tickets v2023.04.30.001 */

const inputConfig = input.config();
const table = base.getTable(inputConfig.input_Table_Name);
const hasData = inputConfig.input_Validation_Field[0];

// Grab field names from inputs, excluding ID and Table fields
let fields = Object.keys(inputConfig).filter(key => {
  return (
    !key.includes("ID_")
    && !key.includes("input")
    && !key.includes("ID_Recipe_Data_Summary")
  )
})
// console.log({fields}) //** Inspect fields */

// Grab Record-Link-IDs from inputs, excluding ID and Table fields
let recordLinkNames = Object.keys(inputConfig).filter(key => {
  return (
    key.includes("ID_")
    && !key.includes("input")
    && !key.includes("ID_Recipe_Data_Summary")
  )
})
// console.log({ recordLinkNames }) // Inspect fields

function createInputs(fieldArray) {
  let fields = {};
  fieldArray.forEach(field => {
    let value = inputConfig[field][0];
    fields[field] = value
    // console.log({field, value) // Inspect field and value

    // ensure clean searchable_id
    if (field === "searchable_id") {
      fields[field] = value ? value.trim().toLowerCase() : null;
    }
  })

  return fields;
}

const inputs = createInputs(fields);

//** Attach the source of normative data */
async function addNormativeDataLink(Record_ID,recordLinkNames) {
  recordLinkNames.forEach(name => {
    table.updateRecordAsync(Record_ID,{
      [name]: [{ id: inputConfig[name][0] }]
    });
  })
}

async function asyncProcessRecords() {
  const { searchable_id } = inputs;
  try {
    const records = await table.selectRecordsAsync({ fields });
    const foundRecord = records.records.find(
      record => record.getCellValueAsString("searchable_id") === searchable_id
    );

    if (!hasData) {
      Action_Status: "Error"
      throw new Error("Missing information");
    };

    if (foundRecord) {
      let updates = {};

      // Determine necessary updates based on new data provided
      for (let [field,value] of Object.entries(inputs)) {
        if (value && value !== foundRecord.getCellValue(field)) {
          updates[field] = value;
        }
      }

      //** Update Record */
      if (Object.keys(updates).length > 0) {
        await table.updateRecordAsync(foundRecord.id,updates);
        await addNormativeDataLink(foundRecord.id,recordLinkNames);

        return { searchable_id,Record_ID: foundRecord.id,Action_Status: "Updated" };
      } else {
        //** Found Record */
        await addNormativeDataLink(foundRecord.id,recordLinkNames);
        return { searchable_id,Record_ID: foundRecord.id,Action_Status: "Found" };
      }
    } else if (hasData) {
      //** Create Record */
      const newRecordId = await table.createRecordAsync({ ...inputs });
      await addNormativeDataLink(newRecordId,recordLinkNames);

      return { searchable_id,Record_ID: newRecordId,Action_Status: "Created" };
    }
  } catch (error) {
    throw new Error(`Error processing records: ${error}`);
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
const { Record_ID,Action_Status } = await asyncProcessRecords();

//** Set Outputs */
output.set("Record_ID",[Record_ID]);
output.set("Action_Status",[Action_Status]);

//** Update Checklist Status */
const checklist = base.getTable("Recipe_Checklist");
// @ts-ignore
const { ID_Recipe_Data_Summary,input_Table_Name } = inputConfig;

const recipeRecord = await checklist.selectRecordAsync(
  ID_Recipe_Data_Summary,
  { fields: [input_Table_Name] }
);

recipeRecord && await checklist.updateRecordAsync(recipeRecord.id,
  { [input_Table_Name]: { name: `${Action_Status}` } }
)
