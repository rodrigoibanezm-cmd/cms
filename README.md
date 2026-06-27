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

# Pipeline IA final

El flujo definitivo del MVP es:

```text
Foto informe + fotos equipo
↓
Pasada barata detecta familia
↓
Busca template base limpio en Drive
↓
Template define campos/checklist a extraer
↓
Pasada cara extrae JSON guiado
↓
Backend llena XLS final
↓
Guarda resultado en Drive/output
```

Documento operativo: `docs/final-flow.md`.

## 1. Entrada

El usuario sube:

* foto del informe técnico;
* una o más fotos del equipo.

---

## 2. Pasada barata

Un modelo barato detecta la familia del informe.

Salida mínima:

```json
{
  "family": "TALADRO",
  "confidence": 0.92
}
```

Si la familia no es confiable, el caso queda pendiente de revisión.

---

## 3. Template base limpio

Con la familia detectada, el backend busca en Drive:

```text
{FAMILIA}_TECNICOS_BASE.xlsx
```

Ese template define:

* campos esperados;
* checklist;
* layout;
* formato final.

---

## 4. Pasada cara guiada

El modelo caro no extrae libremente.

Extrae solo el JSON requerido por el template.

El template manda la extracción.

---

## 5. Generación del Excel

El backend completa el XLS final con código determinístico.

La IA no escribe celdas directamente.

---

## 6. Salida

El archivo final se guarda en Drive/output.

---

# Templates base

Ya existe soporte para construir templates base limpios en Drive.

Referencia: `docs/template-bases-cloud.md`.

Endpoint actual:

```text
api/templates/build-base.js
```

Ese endpoint toma una familia, descarga un candidato XLSX, limpia datos escritos y sube el archivo base a Drive.

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
* Drive/Bases como repositorio de templates limpios.
* Drive/output como destino del XLS final.
* Neon como fuente de verdad.
* Auditoría IA antes de entregar.
* Calibración utilizando informes reales.
* Arquitectura simple y modular.

---

# Decisiones pendientes

* Estrategia de autenticación.
* Integración con ERP.
* Gestión de usuarios y permisos.

---

# Estado del proyecto

MVP en diseño.

La prioridad actual es implementar el procesamiento final usando templates base limpios en Drive.

Cada decisión futura deberá mantener el mismo principio:

**La solución más simple que entregue un resultado confiable y completamente auditable.**
