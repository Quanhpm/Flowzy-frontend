import type {
  GroupStatus,
  ISODateTimeString,
  MeetingStatus,
  TaskPriority,
  TaskStatus,
} from "@/shared/types";

export type DashboardStatsDto = {
  totalGroups: number;
  totalProjects: number;
  totalMentors: number;
  totalMeetings: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  progressPercent: number;
};

export type DashboardGroupProgressDto = {
  groupId: number;
  term: string;
  courseCode: string;
  groupNo: string;
  groupName: string;
  projectName: string | null;
  status: GroupStatus;
  mentorId: number | null;
  mentorCode: string | null;
  mentorName: string | null;
  memberCount: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  progressPercent: number;
  nextDueAt: ISODateTimeString | null;
  updatedAt: ISODateTimeString;
};

export type DashboardCheckpointDto = {
  taskId: number;
  groupId: number;
  groupName: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt: ISODateTimeString | null;
  overdue: boolean;
};

export type DashboardStudentProgressDto = {
  stats: DashboardStatsDto;
  groups: DashboardGroupProgressDto[];
  checkpoints: DashboardCheckpointDto[];
};

export type DashboardMeetingDto = {
  id: number;
  groupId: number;
  groupName: string;
  groupNo: string;
  mentorId: number;
  mentorCode: string;
  mentorName: string;
  startAt: ISODateTimeString;
  endAt: ISODateTimeString;
  status: MeetingStatus;
  meetLink?: string | null;
};

export type DashboardProjectDto = {
  groupId: number;
  term: string;
  courseCode: string;
  groupNo: string;
  groupName: string;
  projectName: string | null;
  ideaDescription: string | null;
  researchDomain: string | null;
  groupStatus: GroupStatus;
  progressPercent: number;
};
