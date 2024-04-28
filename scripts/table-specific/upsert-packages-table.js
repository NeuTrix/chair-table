// ** Find Package Record ID * /
// todo- needs a refactor.  Error handling is not robust

const inputConfig = input.config();
//@ts-ignore
const { Name,ID_Recipe_Data_Summary,input_Table_Name } = inputConfig
const table = base.getTable(input_Table_Name);
console.log({ Name,ID_Recipe_Data_Summary })

async function asyncFindPackageRecordId() {
  let Record_ID = null;
  let Action_Status = null;

  try {
    const records = await table.selectRecordsAsync({ fields: ["Name"] });
    const foundRecord = records.records.find(
      record => record.getCellValueAsString("Name") === Name[0]
    );

    Record_ID = foundRecord && foundRecord.id;
    Action_Status = foundRecord && "Found"
    console.log('Found ID_Package Reord ID',{ Record_ID })

    return { Record_ID,Action_Status };

  } catch (error) {
    Action_Status = "Error"
    throw new Error(`Error processing ID_Packages: ${error}`);
  }
}

//==================================================================
//** Update Single Select */
// 1) Provide this at the end of the file...
// 2) Add ID_Recipe_Data_Summary to the inputConfig and filter it from Fields fns
// 3) update 'asyncProcessRecords' name
// 4) ensure Table name is aligned in ID_Recipe_Data_Summary

//** Execute the function and handle outputs */
// @ts-ignore
const { Record_ID,Action_Status } = await asyncFindPackageRecordId();

//** Set Outputs */
output.set("Record_ID",[Record_ID]);
output.set("Action_Status",[Action_Status]);

//** Update Checklist Status */
const checklist = base.getTable("Recipe_Checklist");
// @ts-ignore

const recipeRecord = await checklist.selectRecordAsync(
  ID_Recipe_Data_Summary,
  { fields: [input_Table_Name] }
);

recipeRecord && await checklist.updateRecordAsync(recipeRecord.id,
  { [input_Table_Name]: { name: `${Action_Status}` } }
)

