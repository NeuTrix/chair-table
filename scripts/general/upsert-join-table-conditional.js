//** version JOIN-02.02.06 */
// add conditional
// logic to lower case

//** Configuration */
// input_table_name
// ID_Recipe_Checklist
// ID for tables to join

// initiate the config
const inputConfig = input.config();
const { input_condition: condition } = inputConfig;
// initiate variables
let Record_ID = null;
let Action_Status = "No Data";

if (condition[0].toLowerCase() === 'yes') {
  const table = base.getTable(inputConfig.input_table_name);

  const fields = Object.keys(inputConfig).filter(field => {
    return (
      !field.includes("input")
      && !field.includes("ID_Recipe_Checklist")
    )
  });
  // console.log({ fields })//** Inspect */

  // get the records
  let selected = await table.selectRecordsAsync({ fields })
  // console.log({ selected }) //** Inspect */

  async function asyncCreateInputs(fieldArray) {
    try {
      let fields = {};
      fieldArray.forEach(field => {
        const value = inputConfig[field][0];
        fields[field] = value
      })
      // console.log({ fields }) //** Inspect */
      return fields;

    } catch (error) {
      throw new Error(`Dab Nabbit! Something is not working in the ${input_table_name} script: ${error}`);
    }
  }

  const inputs = await asyncCreateInputs(fields);
  const [firstSet,secondSet] = Object.entries(inputs);
  const [first_field,First_ID] = firstSet;
  const [second_field,Second_ID] = secondSet;
  // console.log({ inputs,firstSet,secondSet }) //** Inspect */



  // todo: Need to cover edge cases where fields are not there for ID
  // similar to value && value or if inputs > 0

  let foundRecords = selected.records.find(
    record => {

      let cellOneValue = record.getCellValue(first_field)
      let cellTwoValue = record.getCellValue(second_field)
      // console.log({cellOneValue, cellTwoValue}) //** Inspect */

      if (cellOneValue && cellTwoValue) {
        // Investigate why this differs
        let record_One = cellOneValue[0];
        let record_Two = cellTwoValue[0];
        // console.log({ record_One,record_Two,First_ID,Second_ID }) //** Inspect */

        return (record_One.id === First_ID && record_Two.id === Second_ID)
      }
    }
  )
  // console.log({ foundRecords }) //** Inspect */

  // Updated || Found
  if (foundRecords) {
    Record_ID = foundRecords.id;
    Action_Status = "Found";
    // console.log('Found Record',{ foundRecords });//** Inspect */
  } else {
    // Created
    let newRecordId = null;

    try {
      if (First_ID && Second_ID) {
        newRecordId = await table.createRecordAsync({
          [first_field]: [{ id: First_ID }],
          [second_field]: [{ id: Second_ID }],
        });
      }

      Record_ID = newRecordId;
      Action_Status = "Created";
      // console.log('New Record Created',{ newRecordId }) //** Inspect */

    } catch (error) {
      Action_Status = "Error";
      throw new Error("Failed to create Join Record")
    }
  }
}

//** Set Outputs */
output.set("Record_ID",[Record_ID]);
output.set("Action_Status",[Action_Status]);

//** Update Checklist Status */
const checklist = base.getTable("Recipe_Checklist");
// @ts-ignore
const { input_table_name,ID_Recipe_Checklist } = inputConfig;

const recipeRecord = await checklist.selectRecordAsync(
  ID_Recipe_Checklist,
  { fields: [input_table_name] }
);

recipeRecord && await checklist.updateRecordAsync(recipeRecord.id,
  { [input_table_name]: { name: `${Action_Status}` } }
)