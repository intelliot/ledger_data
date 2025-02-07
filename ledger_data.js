const xrpl = require("xrpl");

async function fetchAndWriteLedgerData() {
  const client = new xrpl.Client("wss://s.devnet.rippletest.net:51233");
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
  writeStream.write("[");

  while (marker) {
    response.result.state.forEach((entry) => {
      writeStream.write(JSON.stringify(entry));
      writeStream.write(",");
      totalStateObjectCount++;
      if (totalStateObjectCount % 100 === 0) {
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
    writeStream.write(",");
    totalStateObjectCount++;
  });

  // Remove the last comma
  writeStream.seek(writeStream.tell() - 1);
  writeStream.write("]");
  writeStream.end();

  console.log(`Total state object count: ${totalStateObjectCount}`);
  
  await client.disconnect();
}

fetchAndWriteLedgerData();
