# @pramana/adapters

Legacy system isolation and canonical attribute definition bridges.

## Status

`NOT STARTED` (Setup Phase Only)

## Architecture Pipeline

```
Legacy Source (SQL, ISO 20022, JSON API)
    ↓
Adapter (@pramana/adapters)
    ↓
Canonical Attribute Definition (@pramana/schemas)
    ↓
Credential & Proof Engine (@pramana/crypto, @pramana/proofs)
```

## MVP Scope Adapters

- **Legacy SQL Adapter**: Translates relational records into canonical attributes.
- **ISO 20022 camt.053 XML Adapter**: Translates bank statement records into canonical financial attributes.
- **REST/JSON Adapter**: Translates institutional web APIs.
