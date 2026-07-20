# Execution contract

The compiler certifies only known report sources. `CREATE_FAMILY` is valid only when its immutable `executable_family_source_ref` matches the family's `source_ref`.

At render time, template bytes must match both `size_bytes` and `sha256` before workbook loading. The renderer must reject mismatches.
