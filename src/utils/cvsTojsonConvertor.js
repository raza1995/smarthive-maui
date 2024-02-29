const csvToJsonConvertor = (csvString) => {
  // Convert the data to String and
  // split it in an array
  const array = csvString.split("\n");

  // All the rows of the CSV will be
  // converted to JSON objects which
  // will be added to result in an array
  const result = [];
  const headerStr = array[0].replace(/"/g, "");
  const headers = headerStr.split(",");
  // Since headers are separated, we
  // need to traverse remaining n-1 rows.
  for (let i = 1; i < array.length - 1; i++) {
    const obj = {};

    // Create an empty object to later add
    // values of the current row to it
    // Declare string str as current array
    // value to change the delimiter and
    // store the generated string in a new
    // string s
    const str = array[i];
    let s = "";

    // By Default, we get the comma separated
    // values of a cell in quotes " " so we
    // use flag to keep track of quotes and
    // split the string accordingly
    // If we encounter opening quote (")
    // then we keep commas as it is otherwise
    // we replace them with pipe |
    // We keep adding the characters we
    // traverse to a String s
    let flag = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (let ch of str) {
      if (ch === '"' && flag === 0) {
        flag = 1;
      } else if (ch === '"' && flag === 1) flag = 0;
      if (ch === "," && flag === 0) ch = "|";
      if (ch !== '"') s += ch;
    }
    // Split the string using pipe delimiter |
    // and store the values in a properties array
    const properties = s.split("|");

    // For each header, if the value contains
    // multiple comma separated data, then we
    // store it in the form of array otherwise
    // directly the value is stored
    // eslint-disable-next-line no-restricted-syntax
    for (const j in headers) {
      // console.log("properties", properties[j],j)
      if (properties[j]?.includes(",")) {
        obj[headers[j]] = properties[j].split(",").map((item) => item.trim());
      } else obj[headers[j]] = properties[j];
    }

    // Add the generated object to our
    // result array
    result.push(obj);
  }

  // Convert the resultant array to json and
  // generate the JSON output file.
  // eslint-disable-next-line no-unused-vars
  const json = JSON.stringify(result);

  return result;
};
export default csvToJsonConvertor;
