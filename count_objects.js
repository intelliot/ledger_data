/**
 * Reads a large ledger_data JSON file incrementally and counts the occurrences of specific ledger entry types.
 * 
 * The JSON file is read in chunks to handle large file sizes. In this implementation, the function parses the JSON objects
 * and counts the occurrences of "MPTokenIssuance" and "MPToken" ledger entry types. The counts are logged at milestones.
 */

async function countLedgerEntries() {
  let totalMptIssuance = 0;
  let totalMpToken = 0;

  const fs = require("fs");
  const read = fs.createReadStream("ledger_data Devnet 2025-01-28.json", { encoding: "utf8" });
  let buffer = "";

  read.on("data", (chunk) => {
    buffer += chunk;

    let start = 0;
    let completeObjects = [];
    let braceCount = 0;
    for (let i = 0; i < buffer.length; i++) {
      if (buffer[i] === "{") {
        if (braceCount === 0) {
          start = i;
        }
        braceCount++;
      }
      if (buffer[i] === "}") {
        braceCount--;
        if (braceCount === 0) {
          completeObjects.push(buffer.slice(start, i + 1));
          start = i + 1;
        }
      }
    }

    buffer = buffer.slice(start);
    completeObjects.forEach((part) => {
      try {
        let entry = JSON.parse(part);
        if (entry.LedgerEntryType === "MPTokenIssuance") {
          totalMptIssuance++;
          // Log every 10000
          if (totalMptIssuance % 10000 === 0) {
            console.log(`MPTokenIssuance so far: ${totalMptIssuance}`);
          }
        }
        if (entry.LedgerEntryType === "MPToken") {
          totalMpToken++;
          // Log every 10000
          if (totalMpToken % 10000 === 0) {
            console.log(`MPToken so far: ${totalMpToken}`);
          }
        }
      } catch (e) {
        console.error("Error parsing JSON:", e);
      }
    });

    // To catch problems, kill script if buffer length exceeds 520000
    if (buffer.length > 520000) {
      console.log("Buffer length exceeded 520000, exiting");
      process.exit(0);
    }
  });

  read.on("error", (err) => {
    console.error("Error reading file:", err);
  });

  read.on("end", () => {
    // Log totals
    console.log(`Grand Total MPTokenIssuance count: ${totalMptIssuance}`);
    console.log(`Grand Total MPToken count: ${totalMpToken}`);
  });
}

countLedgerEntries();
