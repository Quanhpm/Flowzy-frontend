import type { GroupDetailDto, GroupSummaryDto } from ".";

export type InstructorGroupsQuery = {
  term?: string;
  courseCode?: string;
};

export type AssignInstructorRequest = {
  instructorId: number;
};

export type AssignGroupInstructorVariables = {
  groupId: number;
  payload: AssignInstructorRequest;
};

export type InstructorGroupSummaryDto = GroupSummaryDto & {
  instructorId: number | null;
  instructorCode: string | null;
  instructorName: string | null;
  isLock: boolean;
};

export type InstructorAssignedGroupDetailDto = GroupDetailDto & {
  instructorId: number | null;
  instructorCode: string | null;
  instructorName: string | null;
  isLock: boolean;
};
