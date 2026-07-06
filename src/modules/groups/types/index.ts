import type {
  ApiListQuery,
  GroupStatus,
  InvitationStatus,
  ISODateTimeString,
  JoinRequestStatus,
  ProblemSourceType,
  ProblemStatus,
} from "@/shared/types";
import type { MentorProfileDto, StudentProfileDto } from "@/modules/users/types";

export type SelectedProblemSummaryDto = {
  id: number;
  code: string;
  title: string;
  sourceType: ProblemSourceType;
  status: ProblemStatus;
};

export type GroupSummaryDto = {
  id: number;
  term: string;
  courseCode: string;
  groupNo: string;
  name: string;
  projectName: string | null;
  leaderName: string | null;
  memberCount: number;
  requiredGpa: number | null;
  targetGrade: number | null;
  status: GroupStatus;
  mentorId: number | null;
  mentorCode: string | null;
  mentorName: string | null;
  selectedProblem: SelectedProblemSummaryDto | null;
};

export type GroupMemberRole = "LEADER" | "MEMBER";

export type GroupMemberDto = {
  studentId: number;
  studentCode: string;
  fullName: string;
  email: string;
  role: GroupMemberRole;
};

export type GroupDetailDto = {
  id: number;
  term: string;
  courseCode: string;
  groupNo: string;
  name: string;
  projectName: string | null;
  ideaDescription: string | null;
  researchDomain: string | null;
  leader: StudentProfileDto | null;
  requiredGpa: number | null;
  targetGrade: number | null;
  status: GroupStatus;
  mentor: MentorProfileDto | null;
  members: GroupMemberDto[];
  selectedProblem: SelectedProblemSummaryDto | null;
};

export type InvitationDto = {
  id: number;
  groupId: number;
  groupName: string;
  groupNo: string;
  courseCode: string;
  term: string;
  inviterId: number;
  inviterCode: string;
  inviterName: string;
  inviteeId: number;
  inviteeCode: string;
  inviteeName: string;
  studentId: number;
  studentCode: string;
  studentName: string;
  status: InvitationStatus;
  message: string | null;
  createdAt: ISODateTimeString;
  respondedAt: ISODateTimeString | null;
};

export type GroupJoinRequestDto = {
  id: number;
  groupId: number;
  groupName: string;
  groupNo: string;
  courseCode: string;
  term: string;
  studentId: number;
  studentCode: string;
  studentName: string;
  status: JoinRequestStatus;
  message: string | null;
  respondedById: number | null;
  respondedByCode: string | null;
  respondedByName: string | null;
  respondedAt: ISODateTimeString | null;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
};

export type CreateGroupRequest = {
  term: string;
  courseCode: string;
  name: string;
  projectName?: string;
  ideaDescription?: string;
  researchDomain?: string;
  requiredGpa?: number;
  targetGrade?: number;
};

export type UpdateGroupRequest = {
  name?: string;
  projectName?: string;
  ideaDescription?: string;
  researchDomain?: string;
  requiredGpa?: number;
  targetGrade?: number;
};

export type UpdateGroupCriteriaRequest = {
  requiredGpa?: number;
  targetGrade?: number;
};

export type TransferLeaderRequest = {
  studentId: number;
};

export type InviteStudentRequest = {
  studentCodeOrEmail: string;
  message?: string;
};

export type CreateJoinRequestDto = {
  message?: string;
};

export type GroupsQuery = Pick<ApiListQuery, "search">;

export type UngroupedStudentsQuery = {
  term: string;
  courseCode: string;
  search?: string;
  page?: number;
  size?: number;
};
