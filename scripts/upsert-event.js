// // Constants and Initial Setup
const table = base.getTable("Events");
const inputConfig = input.config();

let inputFields = [
  "event_name",
  "end_date",
  "event_url",
  "start_date",
  "searchable_id", // using event name
]

function createInputs(inputFields) {
  let inputsTest = {};
  inputFields.forEach(field => {
    let value = inputConfig[field][0];
    inputsTest[field] = value;

    // ensure clean searchable_id for company web url
    if (field === "searchable_id") {
      inputsTest[field] = value.trim().toLowerCase();
    }
  })

  return inputsTest;
}

const inputs = createInputs(inputFields);

//** Manual */
const hasData = inputs.event_name;

//** Attach the source of normative data */
async function addNormativeDataLink(Record_ID) {
  const ID_Normative_Data = inputConfig.ID_Normative_Data[0];
  await table.updateRecordAsync(Record_ID,{
    "ID_Normative_Data": [{ id: ID_Normative_Data }]
  });
}

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

      if (Object.keys(updates).length > 0) {
        await table.updateRecordAsync(foundRecord.id,updates);
        await addNormativeDataLink(foundRecord.id);

        return { searchable_id,Record_ID: foundRecord.id,Action_Status: "Updated" };
      } else {
        await addNormativeDataLink(foundRecord.id);

        return { searchable_id,Record_ID: foundRecord.id,Action_Status: "Found" };
      }
    } else if (hasData) {
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
