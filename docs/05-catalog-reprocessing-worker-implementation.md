# Catalog reprocessing worker implementation

`processNextCatalogReprocessRequest()` performs one iteration only.

It atomically claims one `pending` request with `FOR UPDATE SKIP LOCKED`, marks it `processing`, executes `renderReport(reportId, catalogVersionId)` using only the stored IDs, then records `completed` or `failed`.

It does not schedule, poll, retry, activate, compile, expose an API, or modify UI.
