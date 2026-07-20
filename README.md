# CMS
Digitalización auditada de informes técnicos Covaclean.

## Responsabilidad
```txt
front técnico de carga
api process-report
pipeline de extracción IA
generación XLS determinística
subida de archivos a Drive
persistencia Neon
admin de revisión
auditoría IA
workflow admin/secretaria
PDF final desde XLS aprobado
```
## Fuera de esta repo
```txt
ERP
BI histórico avanzado
gestión completa de usuarios
firma documental final externa
workflow operativo externo a la revisión admin
```
## Principio central
```txt
El técnico carga evidencia.
La IA extrae y audita.
Neon es fuente de verdad.
Drive guarda archivos.
El admin asigna.
La secretaria revisa y aprueba.
```
## Estado actual
```txt
runtime Next.js
pipeline IA conectado
XLS generado desde templates Drive
reports/files/events guardados en Neon
admin visual operativo
asignación y cola de secretaria operativas
aprobación secretaria operativa
PDF final idempotente operativo
Confianza IA disponible como KPI V1
dashboard operativo V1
Config V1 operativa en /config
```
## Catálogo de plantillas v2
```txt
Reportes reales
→ inventario
→ inferencia determinística de familias
→ CONFIRMED / REVIEW / UNMAPPED
→ revisión de evidencia
→ evolución del catálogo
```
Documentación vigente: `TEMPLATE_INVENTORY.md`

Stage 0 convive con producción. No reemplaza todavía el renderer ni compara sistemáticamente toda la cobertura contra maestros `_FINAL`.

## Diseño visual
```txt
docs/ui-design-system.md
```
```txt
UI sobria, técnica, ejecutiva y operacional.
Vista Operación como bandeja de trabajo.
Lenguaje visual transversal a Indicadores, Operación, OT y Configuración.
```
## Regla de trabajo
```txt
1 tarea = 1 chat.
1 chat auditor por tarea.
Al cerrar una tarea se documenta.
El siguiente chat parte leyendo README.md y docs/next-step.md.
```
## Regla de tamaño
```txt
Ningún archivo debe superar 100 líneas.
Si crece, se refactoriza.
1 doc = 1 responsabilidad.
```
## Documentación
```txt
TEMPLATE_INVENTORY.md
docs/README.md
```
Ruta recomendada:
```txt
1. README.md
2. TEMPLATE_INVENTORY.md
3. docs/README.md
4. docs/current-state.md
5. docs/next-step.md
```
## Invariante
```txt
No documentar visión como estado real.
No mezclar deuda técnica con pendientes de diseño.
No agregar casuística si existe una regla general.
```
