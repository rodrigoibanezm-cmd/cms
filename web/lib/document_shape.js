const NARRATIVE = 'narrative_report';

export function isNarrativeReport(pass1) {
  if (String(pass1?.document_structure || '').toLowerCase() === NARRATIVE) return true;
  if (pass1?.has_printed_checklist === false) return true;
  return false;
}

export function forceFallbackForNarrative(pass1, fallbackEntry) {
  if (!isNarrativeReport(pass1)) return null;
  return {
    entry: fallbackEntry,
    similitud: 0,
    structuralSignal: 'narrative_report',
    decision: 'varios',
  };
}
