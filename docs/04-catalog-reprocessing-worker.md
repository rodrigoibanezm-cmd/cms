# Worker de reprocesamiento del catálogo

## Objetivo

Definir el contrato operacional del worker que consume solicitudes creadas por la activación transaccional.

## Estados

```text
pending
    ↓
processing
    ↓
completed
```

o

```text
pending
    ↓
processing
    ↓
failed
```

No existen otros estados en esta etapa.

## Responsabilidad

El worker únicamente:

- consume solicitudes `pending`;
- reclama una solicitud de forma exclusiva;
- reprocesa exactamente un `report_id`;
- usa exactamente el `catalog_version_id` registrado en la solicitud;
- persiste el resultado;
- marca la solicitud como `completed` o `failed`.

El worker nunca:

- activa versiones;
- compila catálogos;
- modifica artefactos del catálogo;
- genera nuevas versiones;
- cambia la versión activa.

## Exclusión

El contrato garantiza:

```text
Una solicitud nunca puede ser procesada simultáneamente por dos workers.
```

La implementación puede usar `FOR UPDATE SKIP LOCKED`, advisory lock, lease o un mecanismo equivalente. El mecanismo no cambia la garantía.

## Secuencia

```text
seleccionar una solicitud pending
reclamarla de forma exclusiva
marcarla processing
cargar report_id y catalog_version_id
reprocesar exactamente ese reporte con esa versión
persistir resultado
marcar completed
```

Si el reprocesamiento falla:

```text
persistir error
marcar failed
```

## Idempotencia

`completed` es terminal.

```text
Una solicitud completed nunca vuelve a ejecutarse.
```

`failed` no se reintenta automáticamente dentro del mismo worker.

Un retry requiere una acción explícita que cambie:

```text
failed → pending
```

El retry conserva el mismo `report_id` y el mismo `catalog_version_id`.

## Relación con la activación

```text
Activación
    ↓
crea pending

Worker
    ↓
consume pending
```

El worker nunca crea solicitudes por cuenta propia y nunca participa en la transacción de activación.

## Fallos y rollback

Si el reprocesamiento falla:

- el reporte puede permanecer sin actualizar;
- la solicitud queda `failed`;
- la versión del catálogo permanece activa;
- nunca se revierte la activación.

## Invariante principal

```text
El catálogo activo nunca depende del éxito del reprocesamiento.
```

La activación es un hecho histórico y transaccional.

El reprocesamiento es una tarea operacional posterior que converge hacia ese estado.

## Fuera de alcance

- SQL concreto de claiming;
- scheduler;
- polling;
- retries automáticos;
- backoff;
- métricas;
- API;
- UI;
- procesamiento en lote;
- cambio de versión activa.
