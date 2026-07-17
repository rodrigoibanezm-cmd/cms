# Workflow

## Responsabilidad

```txt
Definir el flujo operacional completo de una OT.
No describe implementación técnica.
No reemplaza current-state.md.
```

## Actores

```txt
Técnico
Admin
Secretaria
```

## Flujo operacional

```txt
1. El técnico toma la fotografía del informe.
2. El sistema procesa la imagen.
3. Si la imagen no es legible, el técnico debe repetirla.
4. Si el flujo continúa, la OT queda en cola admin sin tenant.
5. El Admin asigna la OT a una secretaria.
6. La asignación fija tenant y dueño actual.
7. Cada secretaria ve su propia cola.
8. La cola incluye pendientes y aprobadas.
9. La secretaria compara informe original contra XLS.
10. La secretaria aprueba la transcripción y fija el XLS vigente por su report_files.id.
11. El sistema lee exclusivamente ese XLS aprobado y genera una propuesta en modo lectura.
12. El PDF actual mantiene su disponibilidad por compatibilidad durante la transición.
```

## Ubicación de la OT

```txt
Cada OT debe tener un estado actual y un dueño actual.
current_state indica dónde está la OT.
current_owner_type indica qué tipo de actor la tiene.
current_owner_id identifica al actor específico.
tenant_id permite separar operación y filtrar cola.
```

## Estados actuales

```txt
processing
admin_queue
assigned_to_secretary
secretary_approved
error
```

## Ejemplos

Sin asignar:

```txt
current_state = admin_queue
current_owner_type = admin
current_owner_id = null
tenant_id = null
```

Asignada:

```txt
current_state = assigned_to_secretary
current_owner_type = secretary
current_owner_id = secretaria_1
tenant_id = tenant_operativo
```

Aprobada:

```txt
current_state = secretary_approved
transcription_approved_at = now()
transcription_approved_xls_file_id = report_files.id vigente
final_report_approved_at = null
```

## Eventos de trazabilidad

```txt
report_events registra cada movimiento relevante.

Ejemplos:
workflow_admin_queue
assigned_to_secretary
transcription_approved
final_report_proposal_generated
final_report_proposal_failed
final_document_generated
```

## Invariantes

```txt
Siempre debe poder saberse dónde está la OT y quién la tiene.
La aprobación no borra la secretaria asignada.
Después de aprobar, el XLS identificado reemplaza al JSON como fuente oficial.
Generar y regenerar propuesta usan transcription_approved_xls_file_id.
Un generated_xls posterior no cambia esa referencia.
Solo una nueva aprobación de transcripción puede cambiarla.
Una aprobación histórica sin referencia debe aprobarse nuevamente; no se infiere.
La propuesta persistida no vuelve a invocar Gemini al abrir la OT.
```

## Qué no hacer

```txt
No inferir el XLS aprobado por orden, fecha ni archivo más reciente.
No mover corrección de datos al técnico.
No crear un workflow engine genérico todavía.
No saltarse la revisión administrativa.
```
