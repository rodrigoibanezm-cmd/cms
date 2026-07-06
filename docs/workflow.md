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
4. Si el flujo continúa, la OT queda en cola admin.
5. El Admin asigna la OT a una secretaria.
6. Cada secretaria ve su propia cola.
7. La cola incluye pendientes y aprobadas.
8. La secretaria compara informe original contra XLS.
9. La secretaria aprueba la OT desde el detalle.
10. Desde la aprobación se habilita el documento final.
```

## Ubicación de la OT

```txt
Cada OT debe tener un estado actual y un dueño actual.
current_state indica dónde está la OT.
current_owner_type indica qué tipo de actor la tiene.
current_owner_id identifica al actor específico.
tenant_id permite filtrar cola por secretaria.
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

Asignada:

```txt
current_state = assigned_to_secretary
current_owner_type = secretary
current_owner_id = secretaria_1
tenant_id = secretaria_1
```

Aprobada por secretaria:

```txt
current_state = secretary_approved
current_owner_type = secretary
current_owner_id = secretaria_1
tenant_id = secretaria_1
secretary_approved_at = now()
```

## Eventos de trazabilidad

```txt
report_events registra cada movimiento relevante.

Ejemplos:
workflow_admin_queue
assigned_to_secretary
secretary_approved
final_document_generated
```

## Invariantes

```txt
Siempre debe poder saberse dónde está la OT.
Siempre debe poder saberse quién tiene la OT.
El técnico no corrige información.
La secretaria hace los fixes cuando exista edición.
La aprobación no borra la secretaria asignada.
La secretaria siempre produce una versión final aprobada.
Siempre existe un documento final antes de continuar el flujo.
```

## Qué no hacer

```txt
No documentar este flujo como implementado completo.
No duplicar este flujo en otros documentos.
No crear un workflow engine genérico todavía.
No mover corrección de datos al técnico.
No saltarse la revisión/fix de secretaria.
```
