// write an Airtable script to update a table called Recipe_Checklist

let table = base.getTable('Recipe_Checklist');

let updateChecklist = async (recordId,field) => {
  let record = await table.find(recordId);
  await table.updateRecordAsync(record,{
    [field]: 'Updated'
  });
  return recordId;
}

output.set('recordId',updateChecklist(input.recordId,input.field));