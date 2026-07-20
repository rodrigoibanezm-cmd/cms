# Catálogo operativo

Estado: especificación vigente.

## 1. Objetivo

Administrar altas y asociaciones de familias con decisiones auditables, versionadas y reproducibles.

## 2. Principios

> El catálogo es un artefacto derivado.
>
> La fuente de verdad son las decisiones de catálogo.

Ningún artefacto compilado se edita manualmente. Ningún cambio existe sin una `CatalogDecision` válida.

## 3. Modelo de datos

Entidades:

- `CatalogDecision`: decisión inmutable registrada por una administrativa;
- `CatalogVersion`: versión compilada y sus hashes;
- `PendingCatalogOT`: OT sin familia disponible;
- `CatalogAudit`: eventos de validación, compilación y reproceso.

Decisiones:

- `ASSOCIATE_EXISTING_FAMILY`;
- `CREATE_FAMILY`;
- `REJECT_INSUFFICIENT_INFORMATION`.

## 4. Estados

Histórico: `CONFIRMED`, `UNMAPPED`.

Operación: `CONFIRMED`, `PENDING_CATALOG`.

`REVIEW` no es un estado automático operativo.

## 5. Flujo operativo

```text
Nueva OT
→ buscar familia en versión activa
→ CONFIRMED o PENDING_CATALOG
→ administrativa registra decisión
→ Validator
→ CatalogCompiler
→ nueva CatalogVersion
→ reproceso exclusivo de la OT origen
```

## 6. Versionado

- `MAJOR`: cambio incompatible de schema o compilación;
- `MINOR`: alta de familia;
- `PATCH`: alias o corrección compatible.

Toda versión referencia a la anterior y conserva hashes de sus artefactos.

## 7. Trazabilidad

Cada decisión registra autor, fecha, OT origen, motivo, tipo, familia y aliases. Auditoría registra resultado, errores, versión creada y OT reprocesada.

## 8. Reproceso

Solo se reprocesa la OT asociada a la decisión. No existe reproceso global desde este flujo.

## 9. Backlog histórico

Los 13 UNMAPPED de `v1.0.0` permanecen pasivos. Se incorporan únicamente ante demanda real.

## 10. Roadmap

1. Infraestructura de decisiones y versiones.
2. Persistencia y compilación transaccional.
3. API de operación.
4. UI administrativa.
5. Activación controlada en producción.

Fuera de alcance: campañas masivas, edición de `families.json`, resolución anticipada del backlog y cambios al renderer productivo.
