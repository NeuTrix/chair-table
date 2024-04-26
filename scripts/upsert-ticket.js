// // Constants and Initial Setup
const table = base.getTable("Tickets");
const inputConfig = input.config();

let inputFields = [
  "ticket_number",
  "ticket_price",
  "ticket_package",
  "order_date",
  "order_number",
  "searchable_id", // using event name
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

//** => Manually update this */
const hasData = inputs.ticket_number;
const ID_Package = inputConfig.ID_Package[0];
const recordLinkNames = [
  "ID_Normative_Data",
  "ID_Normative_Data",
  // "ID_Package",
]


// ** Find Package Record ID * /
async function asyncFindPackageRecordId() {
  const table = base.getTable("Packages");
  const ID_Package = inputConfig.ID_Package[0];

  try {
    const records = await table.selectRecordsAsync({ fields: ["Name"] });
    const foundRecord = records.records.find(
      record => record.getCellValueAsString("Name") === ID_Package
    );

    const Record_ID = foundRecord && foundRecord.id;
    console.log('Found ID_Package Reord ID',{ Record_ID })

    return Record_ID;

  } catch (error) {
    throw new Error(`Error processing ID_Packages: ${error}`);
  }
}

//** Attach the source of normative data */
async function addNormativeDataLink(Record_ID,recordLinkNames) {
  recordLinkNames.forEach(name => {
    table.updateRecordAsync(Record_ID,{
      [name]: [{ id: inputConfig[name][0] }]
    });
  })
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

//** Execute the function and handle outputs */
processRecords().then(result => {
  if (result) {
    output.set("Record_ID",result.Record_ID);
    output.set("Action_Status",result.Action_Status);
  } else {
    output.set("Action_Status","Error");
    throw new Error("No results returned in People script")
  }
});

