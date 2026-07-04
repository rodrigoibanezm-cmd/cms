import { randomUUID } from 'crypto';
import { query } from './db.js';

export const WORKFLOW = {
  PROCESSING_STARTED: 'processing_started',
  PROCESSING_COMPLETED: 'processing_completed',
  PROCESSING_FAILED: 'processing_failed',
};

const TRANSITIONS = {
  [WORKFLOW.PROCESSING_STARTED]: {
    event: 'workflow_processing_started',
    current_state: 'processing',
    current_owner_type: 'system',
    current_owner_id: null,
  },
  [WORKFLOW.PROCESSING_COMPLETED]: {
    event: 'workflow_admin_queue',
    current_state: 'admin_queue',
    current_owner_type: 'admin',
    current_owner_id: null,
  },
  [WORKFLOW.PROCESSING_FAILED]: {
    event: 'workflow_error',
    current_state: 'error',
    current_owner_type: 'system',
    current_owner_id: null,
  },
};

export function initialWorkflowValues() {
  const transition = TRANSITIONS[WORKFLOW.PROCESSING_STARTED];
  return {
    current_state: transition.current_state,
    current_owner_type: transition.current_owner_type,
    current_owner_id: transition.current_owner_id,
  };
}

async function addWorkflowEvent(reportId, transition, payload) {
  await query(
    `INSERT INTO report_events (id, report_id, event, payload_json)
     VALUES ($1, $2, $3, $4)`,
    [randomUUID(), reportId, transition.event, JSON.stringify(payload)]
  );
}

export async function transitionReportWorkflow(reportId, transitionName, payload = {}) {
  const transition = TRANSITIONS[transitionName];
  if (!transition) throw new Error(`Transición workflow inválida: ${transitionName}`);

  await query(
    `UPDATE reports SET current_state=$2, current_owner_type=$3,
      current_owner_id=$4, last_workflow_event_at=now(), updated_at=now()
     WHERE id=$1`,
    [reportId, transition.current_state, transition.current_owner_type, transition.current_owner_id]
  );
  await addWorkflowEvent(reportId, transition, payload);
}