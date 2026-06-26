# CMS — Pipeline, benchmark y plantillas base

Estado documentado al cierre de la sesión de calibración.

## Objetivo actual

Validar el pipeline de extracción antes de construir más producto.

El objetivo no es generar el Excel con IA. La IA solo extrae datos. El Excel final se debe construir por código usando una plantilla XLS oficial.

Flujo de producción esperado:

```text
PDF o foto del informe
↓
Imagen JPG
↓
Pasada 1 barata
↓
Detecta familia + template_key
↓
Busca plantilla XLS base
↓
Pasada 2 cara usando esa plantilla
↓
JSON final
↓
Excel generado por código determinístico
↓
Auditoría
↓
Google Drive
```

## Decisión importante

La primera pasada no debe limitarse a detectar `familia`.

Debe devolver también:

```json
{
  "familia": "CARRETE_ELECTRICO",
  "template_key": "CARRETE_ELECTRICO_TECNICOS",
  "confidence": 0.91
}
```

La segunda pasada debe usar la plantilla real detectada. No debe adivinar los ítems de inspección.

## Plantillas XLS base

Las plantillas base deben vivir en Google Drive en runtime.

En desarrollo pueden vivir localmente como archivos `.xlsx`.

La lógica debe ser:

```text
Si existe plantilla específica → usar esa plantilla.
Si no existe plantilla específica → no inventar.
Si la familia es compatible con formato genérico → usar INFORMES VARIOS.xlsx.
Si la familia es muy distinta → marcar como SIN_BASE.
```

## Plantillas base disponibles hoy

Según `bases.txt`, hoy existen bases para:

- ARRANCADOR_BATERIAS
- BOMBA_HIDRAULICA
- BOMBA_TRASVASIJE
- CILINDRO_HIDRAULICO
- ESMERIL
- GATA_HIDRAULICA
- INFORMES_VARIOS
- LLAVE_TORQUE_IMPACTO
- LLAVE_HIDRAULICA
- TETRAGUAGE
- TORQUE_MANUAL
- TRANSDUCTOR_TORQUE

## Familias observadas sin plantilla base específica

A partir de `carpetas.txt`, aparecen familias sin base específica:

- CARRETE_ELECTRICO
- LUMINARIA / TRIPODE
- GIRAMOTOR
- BATERIA_MILWAUKEE / BATERIA_FORCE
- PISTOLA_CALOR
- MESA_LEVANTE
- FOCO_IMANTADO_MORDAZA
- MAQUINA_SOLDAR
- TALADRO
- BURIL
- ASPIRADORA
- MALETA_E_RAD
- MALETA_TESTEO_PRESION
- MALETA_TESTEO_MOTOR
- TECLE_CADENA
- ULTRASONIDO
- INDICADOR_PRESION_DIGITAL

No todas requieren plantilla propia inmediatamente. Priorizar por volumen y diferencia estructural.

## Prioridad para crear nuevas plantillas

Crear primero plantillas para familias repetidas y estructuralmente distintas:

1. CARRETE_ELECTRICO
2. LUMINARIA / TRIPODE
3. BATERIA_MILWAUKEE
4. GIRAMOTOR
5. MESA_LEVANTE
6. PISTOLA_CALOR

Las familias raras o de baja frecuencia pueden quedar temporalmente como `SIN_BASE` o `INFORMES_VARIOS`, según compatibilidad.

## Hallazgo sobre CARRETE

Caso revisado: `23551`.

El formulario corresponde a carrete eléctrico, pero la familia no estaba en el universo de decisión del prompt.

Resultado observado:

- Gemini dejó `familia: null`.
- Claude clasificó erróneamente como `GATA_HIDRAULICA`.
- OpenAI clasificó erróneamente como `ARRANCADOR_BATERIAS`.

Conclusión: no era un bug del benchmark. Faltaba la familia/template.

Para CARRETE, los ítems observados incluyen:

- Estructura exterior
- Estructura interior
- Cable de poder
- Interruptor
- Manilla de agarre
- Conectores de energía
- Enchufe

## Benchmark actual

Scripts usados:

```text
benchmark/scripts/run_benchmark.js
benchmark/scripts/run_extract.js
benchmark/scripts/validate.js
```

### `run_benchmark.js`

Procesa carpetas, convierte PDF a JPG y ejecuta extracción.

Comando para una OT específica:

```powershell
node benchmark/scripts/run_benchmark.js "C:\Rodrigo\NexusG\Marcelo\OneDrive_1_24-06-2026" 1 23899
```

Comando para N carpetas:

```powershell
node benchmark/scripts/run_benchmark.js "C:\Rodrigo\NexusG\Marcelo\OneDrive_1_24-06-2026" 5
```

### `run_extract.js`

Ejecuta dos pasadas:

- Pasada 1: `gemini-2.5-flash`
- Pasada 2: `gemini-2.5-pro`

Ya debe tener reintentos automáticos ante errores temporales `429`, `500` o `503`.

### `validate.js`

Valida completitud, no exactitud.

Comando:

```powershell
node benchmark/scripts/validate.js "C:\Rodrigo\NexusG\Marcelo\OneDrive_1_24-06-2026"
```

Comando para una OT:

```powershell
node benchmark/scripts/validate.js "C:\Rodrigo\NexusG\Marcelo\OneDrive_1_24-06-2026" 23899
```

El CSV de salida actual es:

```text
benchmark/results/validation_sanity.csv
```

Este score solo responde:

> ¿El JSON viene completo y estructuralmente sano?

No responde todavía:

> ¿El valor coincide exactamente con el Excel digitado?

La validación de exactitud campo por campo queda pendiente.

## Resultado sanity check limpio

Después de borrar JSON antiguos y correr 5 casos desde cero:

```text
Validaciones OK: 5/118
Score completitud promedio: 95.20%
```

Problema detectado:

```text
familia vacía en casos CARRETE
```

Causa: falta `CARRETE_ELECTRICO` como familia/template.

## Regla operativa antes de correr 118 casos

No correr todo el banco hasta que:

1. La familia nunca quede `null`.
2. Exista `template_key` en la pasada 1.
3. Las familias sin plantilla específica queden explícitamente como `SIN_BASE` o `INFORMES_VARIOS`.
4. El validador muestre qué OTs no tienen plantilla.

## Siguiente paso recomendado

1. Crear catálogo de plantillas:

```json
{
  "TORQUE_MANUAL": "TORQUE MANUAL TÉCNICOS (1).xlsx",
  "TETRAGUAGE": "TETRAGUAGE TÉCNICOS (1).xlsx",
  "LLAVE_TORQUE_IMPACTO": "LLAVE DE TORQUE O IMPACTO TÉCNICOS.xlsx",
  "LLAVE_HIDRAULICA": "LLAVE HIDRAULICA TÉCNICOS.xlsx",
  "BOMBA_HIDRAULICA": "BOMBA HIDRAULICA TÉCNICOS.xlsx",
  "BOMBA_TRASVASIJE": "BOMBA TRASVASIJE TÉCNICOS.xlsx",
  "CILINDRO_HIDRAULICO": "CILINDRO HIDRÁULICO TÉCNICOS.xlsx",
  "ESMERIL": "ESMERIL TÉCNICOS.xlsx",
  "GATA_HIDRAULICA": "GATO HIDRÁULICA TÉCNICOS.xlsx",
  "ARRANCADOR_BATERIAS": "ARRANCADOR DE BATERIAS (1).xlsx",
  "TRANSDUCTOR_TORQUE": "TRANSDUCTOR DE TORQUE (1).xlsx",
  "VARIOS": "INFORMES VARIOS.xlsx"
}
```

2. Agregar familias observadas aunque no tengan base todavía:

```text
CARRETE_ELECTRICO
LUMINARIA
GIRAMOTOR
BATERIA_MILWAUKEE
PISTOLA_CALOR
MESA_LEVANTE
FOCO_IMANTADO_MORDAZA
```

3. Cambiar prompt pass 1 para devolver `template_key`.

4. Derivar nuevas plantillas desde Excel ya digitados, partiendo por CARRETE.

## Principio de trabajo

No seguir revisando PDFs uno por uno salvo para diagnosticar una familia/template.

Todo cambio de prompt o pipeline debe correr contra el banco y compararse con métricas.

La métrica actual es completitud. La métrica pendiente es exactitud contra el Excel digitado.