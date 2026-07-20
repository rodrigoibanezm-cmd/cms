# RAD torque

OT revisadas: 17419, 18197, 18287, 18288, 18765 y 23517.

Evidencia:
- 17419, 18197 y 18765 corresponden al modelo E-RAD BLU 3000;
- E-RAD tiene maestro propio y se trata como familia E_RAD;
- 18287 y 18288 son llaves RAD modelos 50DX y 50 SPL;
- 23517 es una B-RAD 1500-2 y ya fue renderizada como LLAVE DE TORQUE O IMPACTO;
- RAD es marca; E-RAD identifica la variante electrica con maestro propio;
- los casos RAD no E-RAD usan la familia general LLAVE_DE_TORQUE_O_IMPACTO.

Decision:
- E-RAD -> E_RAD, CONFIRMED;
- LLAVE TORQUE RAD sin E-RAD -> LLAVE_DE_TORQUE_O_IMPACTO, CONFIRMED;
- TRASDUCTOR DE TORQUE RAD permanece UNMAPPED.

La regla usa secuencias completas y no clasifica por la sola presencia de RAD.
