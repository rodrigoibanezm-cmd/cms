# Third executable family selection

Decision frozen on 2026-07-20 for catalog commit 14. This document records
evidence and scope only; it does not certify or implement another executable
family.

## Sources and method

- Operational inventory: `inventory.json`, 557 real report filenames from the
  certified stage-0 inventory (544 confirmed and 13 unmapped).
- Classification vocabulary: `aliases.json` at catalog version `1.0.0`.
- Candidate masters: `_FINAL.xlsx` files retrieved from the operational Google
  Drive folder on 2026-07-20.
- Technical check: exact byte count and SHA-256, ZIP package integrity, workbook
  and worksheet discovery, and unmodified load attempts with the renderer's
  supported XLSX libraries.

LUMINARIA and ESMERIL are already executable. LLAVE_DE_TORQUE_O_IMPACTO is
excluded because its 127 confirmed reports still combine torque and impact
variants.

## Updated confirmed inventory

| Family | Reports |
| --- | ---: |
| LLAVE_DE_TORQUE_O_IMPACTO | 127 |
| TORQUE_MANUAL | 74 |
| LUMINARIA | 56 |
| ESMERIL | 47 |
| TETRAGUAGE | 38 |
| TECLE | 35 |
| BATERIA | 20 |
| BOMBA_HIDRAULICA | 20 |
| CARRETE_ELECTRICO | 19 |
| GATA_HIDRAULICA | 17 |
| LLAVE_HIDRAULICA | 13 |
| MESA_LEVANTE | 13 |
| CILINDRO_HIDRAULICO | 13 |
| BOMBA_TRASVASIJE | 7 |
| TORQUE_VALVULA | 7 |
| GIRAMOTOR | 6 |
| ARRANCADOR_DE_BATERIAS | 6 |
| BURIL | 3 |
| GRASERA | 3 |
| E_RAD | 3 |
| PISTOLA_CALOR | 2 |
| BARREDORA | 2 |
| ASPIRADORA | 2 |
| DIALIZADORA | 2 |
| BANDEJA_DE_DRENADO | 2 |
| BOMBA_DE_VACIO | 2 |
| MALETA_TESTEO | 2 |
| MULTI_TOOL | 2 |
| TALADRO | 1 |

The remaining 13 records are intentionally unmapped. They are not counted into
a family without evidence. In particular, one TORQUE CLICK and one TORQUE RELOJ
record remain unmapped and are not silently included in TORQUE_MANUAL.

## Leading eligible candidates

| Candidate | Reports | Observed catalog aliases | `_FINAL` master | Technical consistency | Mapping estimate | Classification risk |
| --- | ---: | --- | --- | --- | --- | --- |
| TORQUE_MANUAL | 74 | `TORQUE MANUAL`, `TORQUIMETRO MANUAL` | `TORQUE_MANUAL_FINAL.xlsx`; Drive `1TV_3hb7v5pwkjGgcXaF_k74uUA6o6uoO`; 119,836 bytes; SHA-256 `0433e32dce3a6b07ff4de9ce40230b9c32e8df59d3953bf333a0ad7298a8c742` | Valid XLSX ZIP, two worksheets. The unmodified master uses namespace-prefixed OOXML and does not load in the current supported XLSX parsers. | Medium: direct deterministic metadata/checklist mapping after master normalization and cell certification. | Medium: exact aliases are stable, but CLICK and RELOJ must stay outside scope until separately evidenced. |
| TETRAGUAGE | 38 | `TETRAGUAGE`, `TETRAGAUGE` | `TETRAGUAGE_FINAL.xlsx`; Drive `1ySrYoNwnoko6ndASVLP487Eg0LNhMog6`; 118,472 bytes; SHA-256 `f54ddabc5c45a119cb72d28bd75b6c2e47003beb2761b7c7b76bc54f361c53a0` | Valid XLSX ZIP, two worksheets; same namespace-prefix parser incompatibility. | Medium: direct mapping after normalization, with spelling aliases covered. | Low to medium: two common spellings, already explicit in the catalog. |
| TECLE | 35 | `TECLE`, `TECLE CADENA`, `TECLE PALANCA` | `TECLE_FINAL.xlsx`; Drive `1OMxGhuGBNule2s7aORFsqVXQr1MvviLO`; 434,322 bytes; SHA-256 `9d196ce5c78ff59923b1dec452c09f160ff4989860a786770992864bcc3c421a` | Valid XLSX ZIP; same namespace-prefix parser incompatibility. | High: CADENA and PALANCA variants must be shown to share one certified layout. | High: the family currently combines two operational variants. |
| GIRAMOTOR | 6 | `GIRAMOTOR`, `GIRA MOTOR` | `GIRAMOTOR_FINAL.xlsx`; Drive `1uXl7-XeWMTKmdDJ9ELobIdxxSAlHboiv`; 33,146 bytes; SHA-256 `efbb020e6f4dfe93e9298cd7f12511725d38b6ee31a470b9bb43cf393ce84589` | Valid XLSX ZIP; same namespace-prefix parser incompatibility. | Low to medium after normalization and cell certification. | Low, but operational representation is small. |

The parser incompatibility is a property of the current Drive-generated
masters, not evidence that their business layouts are invalid. Repairing and
recertifying a master belongs to implementation commit 15; changing the
renderer does not.

## Decision

Select **TORQUE_MANUAL** as the third executable family.

It represents 74 confirmed reports: nearly twice TETRAGUAGE, more than twice
TECLE, and over twelve times GIRAMOTOR. It has a dedicated `_FINAL` master and a
narrow exact classifier vocabulary. Its principal risk is explicit and
containable: TORQUE CLICK and TORQUE RELOJ are not TORQUE_MANUAL aliases in this
decision.

## Frozen scope for commit 15

Commit 15 may implement only the following circuit:

- exact family `TORQUE_MANUAL`;
- exact existing aliases `TORQUE MANUAL` and `TORQUIMETRO MANUAL`;
- a normalized and newly certified `TORQUE_MANUAL_FINAL.xlsx` served from Drive,
  with its final byte count and SHA-256 recorded after normalization;
- the minimum deterministic mapping proved against that certified master;
- one public template endpoint, one anonymized real fixture, unit tests, a
  real-byte integration test, full build, and Vercel validation matching the
  LUMINARIA/ESMERIL contract.

Explicitly outside scope: TORQUE CLICK, TORQUE RELOJ,
LLAVE_DE_TORQUE_O_IMPACTO, classifier vocabulary expansion, generic endpoints,
renderer changes, worker changes, database changes, and any fourth family.
