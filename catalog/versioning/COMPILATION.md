# Deterministic catalog compilation

## Inputs

The compiler receives only an immutable catalog snapshot and validated decisions.
It performs no I/O and reads no mutable state.

The executable snapshot contains versioned family sources. A `CREATE_FAMILY` decision must declare
`executable_family_source_ref`, and compilation succeeds only when the matching family source has the
same `source_ref`. Decisions remain the traceable cause of creation; the immutable family source
contains the executable details that do not belong inside the decision payload.

## Executable report sources

Every classifier source and render operation source must belong to the closed `REPORT_SOURCES`
contract. Unknown paths fail certification. Adding a renderer dependency requires extending this
contract before a catalog using that dependency can compile.

## Template integrity

`template_reference.sha256` and `template_reference.size_bytes` are mandatory execution
preconditions, not descriptive metadata.

A renderer consuming a certified catalog must:

1. download the template identified by `drive_file_id`;
2. verify the exact byte length against `size_bytes`;
3. calculate SHA-256 over the downloaded bytes;
4. compare it with `sha256`;
5. reject the render before loading the workbook when either value differs.

Using only `drive_file_id` is not compliant with the executable catalog contract.

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
- a decision attempts to create a family that already exists;
- a family source is absent or does not match its `CREATE_FAMILY` source reference;
- a classifier or mapping requests an unknown report source;
- a template reference lacks verifiable content identity.

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
