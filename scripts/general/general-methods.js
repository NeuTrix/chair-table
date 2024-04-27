
//** Get Linked Inputs from keys */
function createLinkedInputsFromKeys(fieldArray) {
  let inputs = {};
  fieldArray.forEach(key => {
    const value = inputConfig[key];
    inputs[key] = value
  })
  return inputs;
}

// ========================================================

//** Select the Field names */
const getBasicFields = (config) => {
  const fields = Object.keys(config).filter(field => {
    return (
      !field.includes("ID_")
      && !field.includes("input")
      && !field.includes("Role")
    )
  });
  return fields; // add Role Key to output
}

// ========================================================

//** Get linked Fields */
const getLinkedFields = (config) => {
  const fields = Object.keys(config).filter(field => {
    return (
      field.includes("ID_")
    )
  });
  return fields; // add Role Key to output
}

// ========================================================

//** Create inputs object from base fields */
function createInputsFromKeys(fieldArray) {
  let inputs = {};
  fieldArray.forEach(key => {
    const value = inputConfig[key][0];
    inputs[key] = value
  })
  return inputs;
}

//** Get the records */
const asyncGetRecords = async (fieldArray) => {
  const records = await table.selectRecordsAsync(
    { fields: fieldArray }
  );
  return records;
}\

// ========================================================

//** Find record by Role ID */
const asyncFindRecordByRoleId = (records,Role_ID) => {
  const foundRecords = records.records.find(record => {
    const record_Role = record.getCellValue(Role_Key)[0];
    return record_Role.id === Role_ID;
  })
  return foundRecords;
}
