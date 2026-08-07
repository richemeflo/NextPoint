export type PlanningRequestVersion = { current: number };

export function beginPlanningRequest(version: PlanningRequestVersion) {
  version.current += 1;
  return version.current;
}

export function isLatestPlanningRequest(
  version: PlanningRequestVersion,
  requestVersion: number
) {
  return version.current === requestVersion;
}

export function invalidatePlanningRequest(version: PlanningRequestVersion) {
  version.current += 1;
}
