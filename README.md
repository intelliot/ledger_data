# ledger_data

`ledger_data Devnet 2025-01-28.json` is a large (10.21 GB) file containing a ledger state in JSON format. As this is not an efficient way to store the ledger, it's much larger than the actual memory required by `rippled` to store the ledger.

The example scripts in this repo currently count "MPTokenIssuance" and "MPToken" ledger entry types.

`simple_count.js` simply uses substring matching to count the number of a particular type of ledger object.

`count_objects.js` parses the objects and checks the value of the "LedgerEntryType" field.

Usage:

```
npm i
node simple_count
node count_objects
```
