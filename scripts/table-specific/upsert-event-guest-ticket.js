// set the search table name and find the table
let table = base.getTable("Event_Guest_Tickets");

// initiate the config
let inputConfig = input.config();
let Ticket_ID = inputConfig.Ticket_ID; // String from script
let Event_Guest_ID = inputConfig.Event_Guest_ID; // Array fronm Action

// Log some data
console.log({ table,Ticket_ID,Event_Guest_ID })

// initiate variables
let Record_ID = "";
let Action_Status = 'Null';

// get the records
let guests_events = await table.selectRecordsAsync({ fields: ["ID-Ticket","ID-Event_Guest"] })
console.log({ guests_events })

// ? find the guests_events (Linked Table)
let foundRecords = guests_events.records.find(
  item => {
    // important: do not retreive 'string' values
    let ticket_id = item.getCellValue("ID-Ticket");
    let event_guest_id = item.getCellValue("ID-Event_Guest");
    // console.log({ticket_id, event_guest_id})

    return (
      (ticket_id && event_guest_id) &&
      ticket_id[0].id === Ticket_ID &&
      event_guest_id[0].id === Event_Guest_ID
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
      "ID-Ticket": [{ id: Ticket_ID }],
      "ID-Event_Guest": [{ id: Event_Guest_ID }],
    });

    Record_ID = newRecordId;
    Action_Status = "Created";
    console.log('New Record Created',{ newRecordId })
  } catch (error) {
    console.error(error,{ Ticket_ID,Event_Guest_ID });
  }
}

output.set("Record_ID",Record_ID);
output.set("Action_Status",Action_Status);