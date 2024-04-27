// Constants and Initial Setup
// => get the table and variables for roles
const inputConfig = input.config();
const table = base.getTable(inputConfig.input_Table_Name);

// get Role ID and Label
const { Role_Key,Role_Value } = inputConfig;
const Role_ID = Role_Value[0];
// console.log({ Role_Key,Role_ID, Role_Value}) //** Inspect */

// find the records for a linked record
const records = await table.selectRecordsAsync(
  { fields: [Role_Key] }
);

// select record based on the Role_Value  
const foundRecords = records.records.find(record => {
  const record_Role = record.getCellValue(Role_Key)[0];
  return record_Role.id === Role_ID;
})

console.log({ records,foundRecords }) //** Inspect */
