import { ACADEMICS_MODULE } from "./academics";
import { AUTH_MODULE } from "./auth";
import { CHECKPOINTS_MODULE } from "./checkpoints";
import { DASHBOARDS_MODULE } from "./dashboards";
import { GRADING_MODULE } from "./grading";
import { GROUPS_MODULE } from "./groups";
import { MENTORING_MODULE } from "./mentoring";
import { OUTCOMES_MODULE } from "./outcomes";
import { PROBLEMS_MODULE } from "./problems";
import { PROJECTS_MODULE } from "./projects";
import { USERS_MODULE } from "./users";

export const MODULES = [
  AUTH_MODULE,
  USERS_MODULE,
  ACADEMICS_MODULE,
  GROUPS_MODULE,
  PROBLEMS_MODULE,
  PROJECTS_MODULE,
  CHECKPOINTS_MODULE,
  OUTCOMES_MODULE,
  MENTORING_MODULE,
  GRADING_MODULE,
  DASHBOARDS_MODULE,
] as const;
