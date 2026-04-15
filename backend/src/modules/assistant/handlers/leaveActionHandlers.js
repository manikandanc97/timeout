import { callInternalApi } from '../../../services/internalApiService.js';

export async function applyLeaveAction(input, requestContext) {
  return callInternalApi(
    '/leaves',
    {
      method: 'POST',
      body: {
        type: input.type,
        startDate: input.startDate,
        endDate: input.endDate,
        reason: input.reason,
      },
    },
    requestContext,
  );
}

export async function approveLeaveAction(input, requestContext) {
  return callInternalApi(
    `/leaves/${input.requestId}`,
    { method: 'PUT', body: { status: 'APPROVED' } },
    requestContext,
  );
}

export async function rejectLeaveAction(input, requestContext) {
  return callInternalApi(
    `/leaves/${input.requestId}`,
    {
      method: 'PUT',
      body: { status: 'REJECTED', rejectionReason: input.rejectionReason },
    },
    requestContext,
  );
}
