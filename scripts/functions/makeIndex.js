//** version 1.0.0 | Create searchable_id directly from form data*/

function makeIndex(params) {
  return Object.values(params)
    .map(value => value.replace(/\s+/g,"-"))
    .join("-").toLowerCase();
};

output.set("searchable_id",makeIndex({ ...input.config() }));