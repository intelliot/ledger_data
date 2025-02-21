const xrpl = require("xrpl");

async function fetchAndWriteLedgerData() {
  // const client = new xrpl.Client("wss://s.devnet.rippletest.net:51233");
  const client = new xrpl.Client("ws://localhost:6006");
  await client.connect();
  console.log("connected");

  let totalStateObjectCount = 0;

  // Get server_info
  const serverInfo = await client.request({
    command: "server_info",
  });
  console.log(serverInfo);

  let response = await client.request({
    command: "ledger_data",
  });

  let marker = response.result.marker;

  const fs = require("fs");
  // Include the current date in the filename, in yyyy-mm-dd format.
  const date = new Date().toISOString().split("T")[0];
  const writeStream = fs.createWriteStream(`ledger_data Devnet ${date}.json`, { flags: "a" });

  // Write opening array bracket and newline
  writeStream.write("[\n");

  while (marker) {
    response.result.state.forEach((entry) => {
      writeStream.write(JSON.stringify(entry));
      writeStream.write(",");

      // Write a newline between each object
      writeStream.write("\n");

      totalStateObjectCount++;
      if (totalStateObjectCount % 1000 === 0) {
        console.log(`Total state object count: ${totalStateObjectCount}`);
      }
    });

    response = await client.request({
      command: "ledger_data",
      marker,
    });

    marker = response.result.marker;
  }

  response.result.state.forEach((entry) => {
    writeStream.write(JSON.stringify(entry));

    // Write a comma after each object, except the last one
    if (totalStateObjectCount < response.result.state.length - 1)
      writeStream.write(",");

    // Write a newline after each object
    writeStream.write("\n");

    totalStateObjectCount++;
  });

  // Write closing array bracket, and close the write stream
  writeStream.end("]");
  console.log("Write stream closed");

  console.log(`Total state object count: ${totalStateObjectCount}`);
  
  await client.disconnect();
}

fetchAndWriteLedgerData();
