// set the search table name and find the table
const searchTable = "Event_Guest"
let table = base.getTable(searchTable);

// initiate the config
let inputConfig = input.config();
let Guest_ID = inputConfig.Guest_ID; // String from script
let Event_ID = inputConfig.Event_ID[0]; // Array fronm Action

// Log some data
console.log({ table,Guest_ID,Event_ID })

// initiate variables
let Record_ID = "";
let Action_Status = 'Null';

// get the records
let guests_events = await table.selectRecordsAsync({ fields: ["ID-Guest","ID-Event"] })
console.log({ guests_events })

// ? find the guests_events (Linked Table)
let foundRecords = guests_events.records.find(
  item => {
    // important: do not retreive 'string' values
    let guest_id = item.getCellValue("ID-Guest");
    let event_id = item.getCellValue("ID-Event");
    // console.log({guest_id, event_id})

    return (
      (guest_id && event_id) &&
      guest_id[0].id === Guest_ID &&
      event_id[0].id === Event_ID
    )
  }
)

// Updated || Found
if (foundRecords) {
  Record_ID = foundRecords.id;
  Action_Status = "Found";

  console.log('Found Record',{ foundRecords });
}

// Created
if (!foundRecords) {
  let newRecordId = '';
  try {
    newRecordId = await table.createRecordAsync({
      "ID-Guest": [{ id: Guest_ID }],
      "ID-Event": [{ id: Event_ID }],
    });

    Record_ID = newRecordId;
    Action_Status = "Created";
    console.log('New Record Created',{ newRecordId })
  } catch (error) {
    console.error(error,{ Guest_ID,Event_ID });
  }
}

output.set("Record_ID",Record_ID);
output.set("Action_Status",Action_Status);