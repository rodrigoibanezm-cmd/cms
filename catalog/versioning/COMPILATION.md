# Deterministic catalog compilation

## Inputs

The compiler receives only an immutable catalog snapshot and validated decisions.
It performs no I/O and reads no mutable state.

## Canonical decision order

Each validated decision is converted to canonical JSON by recursively sorting object keys.
Decisions are then sorted lexicographically by that complete canonical JSON string.

Therefore ordering includes every persisted domain field, not a partial priority list. Any
independent implementation must use the same recursive key sorting, JSON serialization and
lexicographic comparison.

## Conflict behavior

Before decisions are applied, the complete input is canonicalized and sorted. Alias conflicts
therefore fail independently of input order.

A compilation fails when:

- an alias already belongs to another family;
- an alias targets a family that does not exist;
- a decision attempts to create a family that already exists.

No partial artifact is returned after a conflict.

## Hashes and manifest

The compiler serializes the compiled artifact canonically and calculates its SHA-256. The version
manifest stores that catalog hash; it never hashes the manifest as a replacement for the catalog
hash.

The manifest contains only reproducible inputs:

- schema version;
- catalog version;
- parent version;
- catalog hash;
- decisions hash;
- compiler version.

It must not contain timestamps, users, paths, hosts, process identifiers or environment data.
