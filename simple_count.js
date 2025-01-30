/**
 * Asynchronously processes a large JSON file incrementally to count occurrences of specific ledger entry types.
 * 
 * This function reads a large JSON file incrementally using a read stream to avoid running out of memory on large files.
 * It counts the occurrences of "MPTokenIssuance" and "MPToken" ledger entry types and logs the counts at milestones.
  */

async function countLedgerEntries() {
  let totalMptIssuance = 0;
  let totalMpToken = 0;
  const fs = require("fs");
  const read = fs.createReadStream("ledger_data Devnet 2025-01-28.json", { encoding: "utf8" });
  let buffer = "";

  read.on("data", (chunk) => {
    buffer += chunk;

    // Ensure we have complete LedgerEntryType values
    const parts = buffer.split("},");
    buffer = parts.pop();

    // Count the number of occurrences of "MPTokenIssuance" and "MPToken"
    parts.forEach((part) => {
      if (part.includes('LedgerEntryType":"MPTokenIssuance"')) {
        totalMptIssuance++;
        if (totalMptIssuance % 10000 === 0) {
          console.log(`MPTokenIssuance count: ${totalMptIssuance}`);
        }
      }
      // Important to include the closing double-quote to avoid (double) counting "MPTokenIssuance" as an MPToken
      if (part.includes('LedgerEntryType":"MPToken"')) {
        totalMpToken++;
        if (totalMpToken % 10000 === 0) {
          console.log(`MPToken count: ${totalMpToken}`);
        }
      }
    });
  });

  read.on("end", () => {
    // Log totals
    console.log(`Grand Total MPTokenIssuance count: ${totalMptIssuance}`);
    console.log(`Grand Total MPToken count: ${totalMpToken}`);
  });
}

countLedgerEntries();
