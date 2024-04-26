// Constants and Initial Setup
const table = base.getTable("People"); //** Manual Update */
const inputConfig = input.config();

//** Manual Update */
const inputFields = [
  "first_name",
  "middle_name",
  "last_name",
  "primary_email",
  "secondary_email",
  "primary_phone",
  "secondary_phone",
  "searchable_id",
]

function createInputs(inputFields) {
  let inputsTest = {};
  inputFields.forEach(field => {
    inputsTest[field] = inputConfig[field][0];
  })

  return inputsTest;
}

const inputs = createInputs(inputFields);

//** Attach the source of normative data */
async function addNormativeDataLink(Record_ID) {
  const ID_Normative_Data = inputConfig.ID_Normative_Data[0];
  await table.updateRecordAsync(Record_ID,{
    "ID_Normative_Data": [{ id: ID_Normative_Data }]
  });
}

//** Manual Update */
// todo: make this configurable
const hasData = inputs.first_name && inputs.last_name && inputs.primary_email;

async function processRecords() {
  const { searchable_id } = inputs;

  try {
    const records = await table.selectRecordsAsync({ fields: Object.keys(inputs) });
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

      //** Update */
      if (Object.keys(updates).length > 0) {
        await table.updateRecordAsync(foundRecord.id,updates);
        await addNormativeDataLink(foundRecord.id);

        return { searchable_id,Record_ID: foundRecord.id,Action_Status: "Updated" };

      } else {
        //** Found */
        await addNormativeDataLink(foundRecord.id);

        return { searchable_id,Record_ID: foundRecord.id,Action_Status: "Found" };
      }

    } else if (hasData) {
      //** Create */
      const newRecordId = await table.createRecordAsync({ ...inputs });
      await addNormativeDataLink(newRecordId);

      return { searchable_id,Record_ID: newRecordId,Action_Status: "Created" };
    }
  } catch (error) {
    throw new Error(`Error processing records: ${error}`);
  }
}

// Execute the function and handle outputs
processRecords().then(result => {
  if (result) {
    output.set("Record_ID",result.Record_ID);
    output.set("Action_Status",result.Action_Status);
  } else {
    output.set("Action_Status","Error");
    throw new Error("No results returned in People script")
  }
});