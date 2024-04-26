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
