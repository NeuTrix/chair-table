// // Constants and Initial Setup
const table = base.getTable("Organizations");
const inputConfig = input.config();

let inputFields = [
  "company_name",
  "company_website",
  "company_email",
  "company_phone",
  "searchable_id", // using company website
]

function createInputs(inputFields) {
  let inputsTest = {};
  inputFields.forEach(field => {
    let value = inputConfig[field][0];
    inputsTest[field] = value

    // ensure clean searchable_id for company web url
    if (field === "searchable_id") {
      inputsTest[field] = value.trim().toLowerCase();
    }
  })

  return inputsTest;
}

const inputs = createInputs(inputFields);
const hasData = inputs.company_website;

async function processRecords() {
  const { searchable_id } = inputs;
  try {
    const records = await table.selectRecordsAsync({ fields: Object.keys(inputs) });
    const foundRecord = records.records.find(
      record => record.getCellValueAsString("searchable_id") === searchable_id
    );

    if (!hasData) {
      Action_Status: "Error"
      throw new Error("Missing person information");
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
        console.log('Updated Record',{ Record_ID: foundRecord.id,Updates: updates });

        return { searchable_id,Record_ID: foundRecord.id,Action_Status: "Updated" };
      } else {

        return { searchable_id,Record_ID: foundRecord.id,Action_Status: "Found" };
      }
    } else if (hasData) {
      const newRecordId = await table.createRecordAsync({ ...inputs });

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
