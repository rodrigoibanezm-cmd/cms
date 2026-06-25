# CMS

## Objetivo

Digitalizar automáticamente los informes técnicos realizados en terreno y eliminar la transcripción manual hacia Excel.

El técnico trabaja exactamente igual que hoy: inspecciona el equipo, completa el formulario y toma fotografías. La diferencia es que el sistema transforma ese proceso manual en un documento digital completamente auditable.

---

## Problema actual

Hoy el flujo es:

Técnico
↓
Completa informe manuscrito
↓
Toma fotografías
↓
Secretaria transcribe toda la información a un Excel
↓
Se generan los documentos finales.

Este proceso consume tiempo, genera errores de digitación y no deja trazabilidad del proceso de extracción.

---

## Flujo objetivo

Técnico
↓
Fotografía formulario
↓
Fotografía equipo
↓
Enviar
↓
Pipeline IA
↓
Excel generado automáticamente
↓
Auditoría IA
↓
Google Drive

---

## Principios

- El técnico nunca debe escribir dos veces la misma información.
- La IA extrae información; no genera el Excel.
- El Excel se construye únicamente mediante código determinístico utilizando la plantilla oficial del cliente.
- Neon es la fuente de verdad del sistema.
- El Excel es un entregable, no la base de datos.
- Todo procesamiento debe ser auditable.

---

## Pipeline

El sistema ejecuta múltiples etapas de extracción y validación.

Dos modelos realizan una primera extracción en paralelo. Cuando existe una diferencia relevante entre ambos resultados, un modelo de mayor capacidad resuelve únicamente los campos conflictivos.

El resultado final es un JSON estructurado que representa la información validada del informe.

Ese JSON alimenta el generador determinístico del Excel.

Finalmente, una IA realiza una auditoría comparando el formulario original, las fotografías y el Excel generado antes de entregar el documento al cliente.

---

## Base de datos

Toda la información se almacena en Neon.

Entre otros:

- Órdenes de trabajo.
- Fotografías originales.
- Resultados de cada pasada IA.
- JSON final.
- Auditorías.
- Costos.
- Versiones del pipeline.
- Excel generado.

Esto permite reconstruir completamente cualquier procesamiento realizado.

---

## Objetivo de calidad

El proyecto busca alcanzar al menos un 90% de informes procesados sin intervención humana.

Para ello se utilizará un banco cercano a 100 informes reales durante la etapa de calibración y pruebas.

---

## Estado del proyecto

Proyecto en etapa de diseño del MVP.

Las decisiones de arquitectura se documentarán a medida que evolucionen, privilegiando siempre soluciones simples, determinísticas y fácilmente auditables.
