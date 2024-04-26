// ** Find Package Record ID * /
const table = base.getTable("Packages");
const inputConfig = input.config();
const Name = inputConfig.Name[0];

async function findPackageRecordId() {

  try {
    const records = await table.selectRecordsAsync({ fields: ["Name"] });
    const foundRecord = records.records.find(
      record => record.getCellValueAsString("Name") === Name
    );

    const Record_ID = [foundRecord && foundRecord.id];
    console.log('Found ID_Package Reord ID',{ Record_ID })

    return { Record_ID };

  } catch (error) {
    throw new Error(`Error processing ID_Packages: ${error}`);
  }
}

//** Execute the function and handle outputs */
findPackageRecordId().then(result => {
  if (result) {
    output.set("Record_ID",result.Record_ID);
    output.set("Name",Name);
  } else {
    output.set("Action_Status","Error");
    throw new Error("No results returned in People script")
  }
});
