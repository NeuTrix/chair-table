// CONTACTS v.2024.05.06.001 
// fixes null records errors
// set the search table name and find the table
//** SPECIAL CONFIGURATION */

//** INPUTS:
/* input_table_name: Contacts
/* ID_Person
/* ID_Organization
/* ID_Recipe_Data_Summary
/* input_is_company_contact
*/

// initiate the config
const inputConfig = input.config();
// @ts-ignore
const contact = inputConfig.input_is_company_contact[0];
// console.log({contact,C: contact.toLowerCase()}) //** Inspect */

// Only run for corp contacts
if (contact.toLowerCase() === "yes") {
  const table = base.getTable(inputConfig.input_table_name);

  const fields = Object.keys(inputConfig).filter(field => {
    return (
      !field.includes("input")
      && !field.includes("ID_Recipe_Data_Summary")
    )
  });
  // console.log({ fields })//** Inspect */

  // get the records
  let selected = await table.selectRecordsAsync({ fields })
  // console.log({ selected }) //** Inspect */

  // ? find the guests_events (Linked Table)
  const inputs = await asyncCreateInputs(fields);
  const [firstSet,secondSet] = Object.entries(inputs);
  const [first_field,First_ID] = firstSet;
  const [second_field,Second_ID] = secondSet;

  async function asyncCreateInputs(fieldArray) {
    let fields = {};
    fieldArray.forEach(field => {
      const value = inputConfig[field][0];
      fields[field] = value
    })

    return fields;
  }

  // initiate variables
  let Record_ID = null;
  let Action_Status = null;
  // console.log({ inputs,firstSet,secondSet }) //** Inspect */

  let foundRecords = selected.records.find(
    record => {
      let record_One = record.getCellValue(first_field);
      let record_Two = record.getCellValue(second_field);
      // cover for cases where field values are null
      return (
        record_One && record_One[0].id === First_ID &&
        record_Two && record_Two[0].id === Second_ID
      )
    }
  )
  // console.log({ foundRecords }) //** Inspect */

  // Updated || Found
  if (foundRecords) {
    Record_ID = foundRecords.id;
    Action_Status = "Found";
    console.log('Found Record',{ foundRecords })  //** Inspect */
  }

  // Created
  if (!foundRecords) {
    let newRecordId = null;
    try {
      newRecordId = await table.createRecordAsync({
        [first_field]: [{ id: First_ID }],
        [second_field]: [{ id: Second_ID }],
      });

      Record_ID = newRecordId;
      Action_Status = "Created";
      console.log('New Record Created',{ newRecordId }) //** Inspect */
    } catch (error) {
      throw new Error("Failed to create Join Record")
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
  // const { Record_ID,Action_Status } = await asyncProcessRecords();

  //** Set Outputs */
  output.set("Record_ID",[Record_ID]);
  output.set("Action_Status",[Action_Status]);

  //** Update Checklist Status */
  const checklist = base.getTable("Recipe_Checklist");
  // @ts-ignore
  const { input_table_name,ID_Recipe_Data_Summary } = inputConfig;
  // console.log({ID_Recipe_Data_Summary, input_table_name}) //** Inspect */

  const recipeRecord = await checklist.selectRecordAsync(
    ID_Recipe_Data_Summary,
    { fields: [input_table_name] }
  );

  recipeRecord && await checklist.updateRecordAsync(recipeRecord.id,
    { [input_table_name]: { name: `${Action_Status}` } }
  )
} else {
  output.set("Action_Status","Null");
}