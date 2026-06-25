# CMS

# Digitalización Inteligente de Informes Técnicos

## Visión

Este proyecto nace para eliminar uno de los procesos más manuales de la operación de Covaclean.

Hoy un técnico inspecciona un equipo en terreno, completa un formulario manuscrito, toma fotografías y entrega toda esa información para que posteriormente otra persona vuelva a digitar el contenido en un Excel.

El objetivo no es construir un OCR.

El objetivo es construir un sistema confiable que transforme un proceso manual en un proceso digital completamente auditable.

---

# Problema actual

El proceso actual es el siguiente.

```text
Técnico

↓

Inspecciona el equipo

↓

Completa formulario en papel

↓

Toma fotografías

↓

Entrega informe

↓

Secretaria digita nuevamente toda la información

↓

Genera Excel

↓

Se generan documentos finales
```

Este flujo tiene varios problemas:

* Trabajo duplicado.
* Errores de digitación.
* Alto tiempo administrativo.
* No existe trazabilidad del proceso de extracción.
* No existe forma simple de auditar cómo se obtuvo un dato.

---

# Objetivo

El técnico debe trabajar prácticamente igual que hoy.

No queremos cambiar la operación.

Solo eliminar la etapa manual de transcripción.

El flujo esperado será:

```text
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
```

El resultado final debe ser exactamente el mismo Excel que hoy utiliza la empresa.

---

# Filosofía

Este proyecto se basa en algunos principios simples.

## La IA extrae información.

No genera documentos.

---

## El Excel nunca lo genera una IA.

El Excel siempre será construido mediante código determinístico utilizando una plantilla oficial.

Eso garantiza consistencia y elimina variabilidad.

---

## Neon es la fuente de verdad.

El Excel es únicamente un entregable.

Toda la información vive en la base de datos.

---

## Todo debe ser auditable.

Cada decisión tomada por el sistema debe poder reconstruirse posteriormente.

---

## La simplicidad tiene prioridad.

Se privilegiarán soluciones simples antes que arquitecturas complejas.

---

# Pipeline IA

Todavía no existe una implementación definitiva.

El pipeline irá evolucionando durante la etapa de calibración.

Actualmente la idea es la siguiente.

## Primera extracción

Dos modelos realizan una extracción independiente del formulario.

Si ambos resultados son consistentes, el procesamiento continúa.

El objetivo es minimizar costo utilizando modelos pequeños.

---

## Resolución de conflictos

Si existen diferencias relevantes entre ambas extracciones, un modelo de mayor capacidad analiza únicamente los campos conflictivos.

No reprocesa el documento completo.

---

## Normalización

Una vez resueltos los conflictos se genera un JSON estructurado.

Este JSON representa la verdad operacional del informe.

---

## Generación del Excel

El sistema toma el JSON y completa automáticamente la plantilla Excel correspondiente.

Las fotografías también se incorporan automáticamente.

No participa ninguna IA en esta etapa.

---

## Auditoría

Una IA compara:

* formulario original
* fotografías
* JSON final
* Excel generado

Si detecta inconsistencias, el documento queda pendiente de revisión.

Si no existen observaciones, el archivo se entrega automáticamente.

---

# Calibración

Antes de poner el sistema en producción se construirá un banco de aproximadamente 100 informes reales.

Cada cambio de prompts, modelos o pipeline deberá ejecutarse nuevamente sobre ese banco.

La calidad se medirá utilizando datos reales y no percepción.

El objetivo mínimo es:

**90% de informes procesados sin intervención humana.**

---

# Base de datos

Neon será el repositorio principal del sistema.

Entre otros elementos se almacenarán:

* órdenes de trabajo
* fotografías originales
* resultados de cada pasada IA
* JSON final
* auditorías
* costos
* tiempos
* versiones del pipeline
* archivos generados

Esto permitirá reconstruir completamente cualquier procesamiento realizado.

---

# Qué queremos obtener

Más allá del Excel, el proyecto comienza a construir un histórico operacional.

Eso permitirá responder preguntas como:

* ¿Qué técnicos generan más informes?
* ¿Qué campos presentan más errores?
* ¿Qué equipos llegan con mayor frecuencia?
* ¿Qué clientes presentan más reparaciones?
* ¿Cuánto cuesta procesar una OT?
* ¿Qué versión del pipeline obtiene mejores resultados?

Con el tiempo el sistema deja de ser solamente un digitalizador de formularios y comienza a transformarse en una fuente de información operacional.

---

# Decisiones tomadas

* Aplicación web móvil.
* Sin instalación.
* Excel determinístico.
* Google Drive como destino.
* Neon como fuente de verdad.
* Auditoría IA antes de entregar.
* Calibración utilizando informes reales.
* Arquitectura simple y modular.

---

# Decisiones pendientes

* Pipeline definitivo.
* Estrategia de autenticación.
* Manejo de múltiples tipos de formularios.
* Integración con ERP.
* Gestión de usuarios y permisos.

---

# Estado del proyecto

MVP en diseño.

La prioridad actual es validar el pipeline de extracción utilizando formularios reales antes de desarrollar funcionalidades adicionales.

Cada decisión futura deberá mantener el mismo principio:

**La solución más simple que entregue un resultado confiable y completamente auditable.**
