# Certified executable catalog

`CREATE_FAMILY` must reference an immutable family source through `executable_family_source_ref`.
The matching source must expose the same `source_ref`.

Template references are execution preconditions. A renderer must verify both `size_bytes` and SHA-256 over downloaded bytes before loading the workbook. Using only `drive_file_id` is non-compliant.
