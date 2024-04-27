// Constants and Initial Setup
// => get the table and variables for roles
const inputConfig = input.config();
const table = base.getTable(inputConfig.input_Table_Name);

// @ts-ignore
const { Role_Key,Role_Value } = inputConfig;
const Role_ID = Role_Value[0];

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

const getLinkedFields = (config) => {
  const fields = Object.keys(config).filter(field => {
    return (
      field.includes("ID_")
      // && !field.includes("input")
      // && !field.includes("Role")
    )
  });
  return fields; // add Role Key to output
}
// console.log({ getBasicFields: getBasicFields(inputConfig),getLinkedFields: getLinkedFields(inputConfig) }) //** Inspect */

//** Create inputs object from base fields */
function createInputsFromKeys(fieldArray) {
  let inputs = {};
  fieldArray.forEach(key => {
    const value = inputConfig[key][0];
    inputs[key] = value
  })
  return inputs;
}
function createLinkedInputsFromKeys(fieldArray) {
  let inputs = {};
  fieldArray.forEach(key => {
    const value = inputConfig[key];
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
}

//** Find record by Role ID */
const asyncFindRecordByRoleId = (records,Role_ID) => {
  const foundRecords = records.records.find(record => {
    const record_Role = record.getCellValue(Role_Key)[0];
    return record_Role.id === Role_ID;
  })
  return foundRecords;
}

async function asyncUpsertRole(params) {
  let Record_ID = null;
  let Action_Status = null;
  const { inputConfig,Role_ID,Role_Key } = params;

  // select the fields
  const basicFields = getBasicFields(inputConfig);
  const linkedFields = getLinkedFields(inputConfig);

  // find the records for basic fields including Role Key 
  const allRecords = await asyncGetRecords([...basicFields,Role_Key]);
  // get the records
  const foundRecord = await asyncFindRecordByRoleId(allRecords,Role_ID);
  // console.log({ fields: basicFields,allRecords,foundRecord }) //** Inspect */

  try {
    if (foundRecord) {
      Record_ID = foundRecord.id;

      //** Update Basic Fields */
      if (basicFields.length > 0) {
        const basicInputs = createInputsFromKeys(basicFields);
        let updates = {};

        // Determine necessary updates based on new data provided
        for (const [field,value] of Object.entries(basicInputs)) {
          if (value && value !== foundRecord.getCellValue(field)) {
            updates[field] = value;
          }
        }
        if (Object.keys(updates).length > 0) {
          console.log("==>",{ foundRecord,updates }) //** Inspect */
          await table.updateRecordAsync(foundRecord.id,updates);
        }
      }

      //** Update Linked ID fields */
      if (linkedFields.length > 0) {
        const linkedInputs = createInputsFromKeys(linkedFields);
        console.log("==>",{ linkedFields,linkedInputs }) //** Inspect */

        let linkedUpdates = {};

        // Determine necessary updates based on new data provided
        for (const [field,value] of Object.entries(linkedInputs)) {
          if (value && value !== foundRecord.getCellValue(field)) {
            linkedUpdates[field] = [{ id: value }];
          }
        }
        if (Object.keys(linkedUpdates).length > 0) {
          await table.updateRecordAsync(foundRecord.id,linkedUpdates);
        }

      }

      else {
        //** Found */
      }
      // Action_Status = "Found";
      Action_Status = "Updated";

    } else {
      //** Create */
      // const newRecord = await table.createRecordAsync({
      //   [Role_Key]: [{ id: Role_ID }]
      // });
      Action_Status = "Created";
    }

    // console.log("Hi",{ Record_ID,Action_Status })

    return { Record_ID,Action_Status }

  } catch (error) {
    console.error(error);
    throw new Error("Something is not working in the Role script");
  }
}

const test = await asyncUpsertRole({ inputConfig,Role_ID,Role_Key })
console.log({ test }) //** Inspect */


// const newRecord = await table.createRecordAsync({
//   [Role_Key]: [{ id: Role_ID }]
// });


// // ========================================================
// // Constants and Initial Setup
// // => get the table and variables for roles
// const inputConfig = input.config();
// const table = base.getTable(inputConfig.input_Table_Name);

// // @ts-ignore
// const { Role_Key,Role_Value } = inputConfig;
// const Role_ID = Role_Value[0];

// //** Select the Field names */
// const getFields = (config) => {
//   const fields = Object.keys(config).filter(field => {
//     return (
//       !field.includes("input")
//       && !field.includes("Role")
//     )
//   });
//   return fields; // add Role Key to output
// }

// //** Get the records */
// const asyncGetRecords = async (fieldArray) => {
//   const records = await table.selectRecordsAsync(
//     { fields: fieldArray }
//   );
//   return records;
// }

// //** Find record by Role ID */
// const asyncFindRecordByRoleId = (records,Role_ID) => {
//   const foundRecords = records.records.find(record => {
//     const record_Role = record.getCellValue(Role_Key)[0];
//     return record_Role.id === Role_ID;
//   })
//   return foundRecords;
// }

// async function asyncUpsertRole(params) {
//   let Record_ID = null;
//   let Action_Status = null;
//   const { inputConfig,Role_ID,Role_Key } = params;

//   // select the fields
//   const fields = getFields(inputConfig);
//   // add Role Key to fields
//   const fieldsWithRole = [...fields,Role_Key];
//   // find the records for a linked record
//   const allRecords = await asyncGetRecords(fieldsWithRole);
//   // get the records
//   const foundRecord = await asyncFindRecordByRoleId(allRecords,Role_ID);

//   console.log({ allRecords,foundRecord }) //** Inspect */

//   try {
//     if (foundRecord) {
//       if (fields.length > 0) {
//         //** Update Record */
//         Record_ID = foundRecord.id;
//         await table.updateRecordAsync(Record_ID,{ [Role_Key]: [{ id: Role_ID }] });
//         Action_Status = "Updated";
//       } else if (fields.length === 0) {
//         //** Update Record */
//         Record_ID = foundRecord.id;
//         Action_Status = "Found";
//       }

//     } else {
//       //** Create Record */
//       const newRecord = await table.createRecordAsync({
//         [Role_Key]: [{ id: Role_ID }]
//       });
//     }
//     console.log("hi",{ Record_ID,Action_Status })
//     return { Record_ID,Action_Status }
//   } catch (error) {
//     console.error(error);
//   }

// }

// const test = await asyncUpsertRole({ inputConfig,Role_ID,Role_Key })
// console.log({ test }) //** Inspect */


// // ************************************************

// // find the records for a linked record
// const records = await table.selectRecordsAsync(
//   { fields: [Role_Key] }
// );

// // select record based on the Role_Value  
// const foundRecords = records.records.find(record => {
//   const record_Role = record.getCellValue(Role_Key)[0];
//   return record_Role.id === Role_ID;
// })
// // console.log({ records, foundRecords }) //** Inspect */

// // update base field filtered array
// function asyncCreateInputsFromKeys(fieldArray) {
//   let inputs = {};
//   fieldArray.forEach(key => {
//     const value = inputConfig[key][0];
//     inputs[key] = value

//     if (key === "searchable_id") {
//       inputs[key] = value ? value.trim().toLowerCase() : null;
//     }
//   })

//   return inputs;
// }
// // ======================================================= 
// async function asyncProcessRecords() {
//   let Record_ID = null;
//   let Action_Status = null;

//   try {
//     if (foundRecords) {


//       // update the link records
//       const recordID = foundRecords.id;
//       const updatedRecord = await table.updateRecordAsync(recordID,{
//         [Role_Key]: [{ id: Role_ID }]
//       });

//     } else {
//       // create a new record
//       const newRecord = await table.createRecordAsync({
//         [Role_Key]: [{ id: Role_ID }]
//       });
//       // console.log({ newRecord }) //** Inspect */

//     }

//     return { Record_ID,Action_Status }
//   } catch (error) {


//   }
// }


// create list of field ids excluding the Roles
// const filterBasicFields = (config) => {
//   const fields = Object.keys(config).filter(field => {
//     return (
//       !field.includes("Role") // excludes Role fields
//       && !field.includes("input") // excludes input fields
//       && !field.includes("ID_") // excludes linked fields
//       && !field.includes("is_") // excludes logic fields
//     );
//   });
//   return fields;
// }
// const filteredFields = filterBasicFields(inputConfig);
// console.log({ filteredFields }) //** Inspect */

// const filterLinkedFields = (config) => {
//   const recordLinks = Object.keys(config).filter(field => {
//     return (
//       field.includes("ID_") // includes linked fields
//     );
//   });
//   return recordLinks;
// }
// const filteredLinks = filterLinkedFields(inputConfig);
// console.log({