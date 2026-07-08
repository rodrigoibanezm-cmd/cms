import { randomUUID } from 'crypto';
import { query } from './db.js';

export const WORKFLOW = {
  PROCESSING_STARTED: 'processing_started',
  PROCESSING_COMPLETED: 'processing_completed',
  PROCESSING_FAILED: 'processing_failed',
  ASSIGNED_TO_SECRETARY: 'assigned_to_secretary',
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
  [WORKFLOW.ASSIGNED_TO_SECRETARY]: {
    event: 'assigned_to_secretary',
    current_state: 'assigned_to_secretary',
    current_owner_type: 'secretary',
    owner_from_payload: true,
    touch_assigned_at: true,
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
    `INSERT INTO report_events (id, tenant_id, report_id, event, payload_json)
     VALUES ($1, (SELECT tenant_id FROM reports WHERE id=$2), $2, $3, $4)`,
    [randomUUID(), reportId, transition.event, JSON.stringify(payload)]
  );
}

function ownerIdFor(transition, payload) {
  if (!transition.owner_from_payload) return transition.current_owner_id;
  return payload.current_owner_id || payload.secretary_id || null;
}

export async function transitionReportWorkflow(reportId, transitionName, payload = {}) {
  const transition = TRANSITIONS[transitionName];
  if (!transition) throw new Error(`Transición workflow inválida: ${transitionName}`);

  await query(
    `UPDATE reports SET current_state=$2, current_owner_type=$3,
      current_owner_id=$4,
      assigned_at=CASE WHEN $5 THEN now() ELSE assigned_at END,
      last_workflow_event_at=now(), updated_at=now()
     WHERE id=$1`,
    [reportId, transition.current_state, transition.current_owner_type,
      ownerIdFor(transition, payload), Boolean(transition.touch_assigned_at)]
  );
  await addWorkflowEvent(reportId, transition, payload);
}
