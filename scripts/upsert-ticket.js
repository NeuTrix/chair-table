// Set the search table name and find the table
const searchTable = "Guest_Roles"
let table = base.getTable(searchTable);

// Initiate the config
let inputConfig = input.config();
let { Person_ID } = inputConfig;

// Initiate variables
let Record_ID = "";
let Action_Status = 'Null';

// Get the records
let guests = await table.selectRecordsAsync({ fields: ["ID-Person"] });

// Find the guests (Linked Table)
let foundRecords = guests.records.find(item => {
  let person = item.getCellValue("ID-Person");
  // Ensure person is not null and the array is not empty
  return person && person.length > 0 && person[0].id === Person_ID;
});

// Updated || Found
if (foundRecords) {
  Record_ID = foundRecords.id;
  Action_Status = "Found";
  console.log('Found Record',{ Record_ID });
} else {
  // Create a new record if no existing record is found
  try {
    let newRecord = await table.createRecordAsync({
      "ID-Person": [{ id: Person_ID }]
    });
    Record_ID = newRecord.id;  // Use .id of the result directly
    Action_Status = "Created";
    console.log('New Record Created',{ Record_ID });
  } catch (error) {
    console.error('Failed to create new record:',error);
    Record_ID = "";  // Reset Record_ID in case of error
    Action_Status = "Error";
  }
}

// Ensure that Record_ID and Action_Status are defined
Record_ID = Record_ID || "";  // Ensure Record_ID is not undefined
Action_Status = Action_Status || "Undefined Status";  // Provide a default status if not set

// Set outputs safely
output.set("Record_ID",Record_ID);
output.set("Action_Status",Action_Status);
