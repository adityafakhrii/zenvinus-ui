/**
 * Zenvinus — Company team & seats data layer (mock backend).
 *
 * In production every helper below maps 1:1 to a backend endpoint:
 *   getSeats()          -> GET /api/company/team/seats
 *   getTeamMembers()    -> GET /api/company/team/members
 *   getPendingInvites() -> GET /api/company/team/invites
 */
import type { PendingInvite, RoleGuideEntry, Seats, TeamMember } from "../types/team";


export const getSeats = (): Seats => ({
  used: 18,
  total: 25,
  available: 7,
  plan: "Enterprise",
  renew: "Mar 31, 2027",
});

export const getTeamMembers = (): TeamMember[] => [
  { name: "Faris A.", email: "faris@zenvinuslabs.io", role: "Owner", roleTone: "purple", projects: 6, status: "Active", statusTone: "mint", joined: "Jan 12, 2026", initials: "FA", tone: "blue" },
  { name: "Nadia K.", email: "nadia@zenvinuslabs.io", role: "Admin", roleTone: "blue", projects: 4, status: "Active", statusTone: "mint", joined: "Feb 03, 2026", initials: "NK", tone: "mint" },
  { name: "Yoga P.", email: "yoga@zenvinuslabs.io", role: "Reviewer", roleTone: "mint", projects: 3, status: "Active", statusTone: "mint", joined: "Mar 21, 2026", initials: "YP", tone: "purple" },
  { name: "Sari M.", email: "sari@zenvinuslabs.io", role: "Annotator", roleTone: "orange", projects: 2, status: "Active", statusTone: "mint", joined: "Apr 08, 2026", initials: "SM", tone: "orange" },
  { name: "Rina W.", email: "rina@zenvinuslabs.io", role: "Reviewer", roleTone: "mint", projects: 2, status: "Active", statusTone: "mint", joined: "May 19, 2026", initials: "RW", tone: "mint" },
  { name: "Tono B.", email: "tono@zenvinuslabs.io", role: "Annotator", roleTone: "orange", projects: 1, status: "Pending", statusTone: "amber", joined: "Sep 30, 2026", initials: "TB", tone: "blue" },
];

export const getPendingInvites = (): PendingInvite[] => [
  { email: "dewi.anggraini@partner.io", role: "Annotator", sent: "Oct 03, 2026" },
  { email: "hendra.s@zenvinuslabs.io", role: "Reviewer", sent: "Sep 28, 2026" },
];

export const getRoleGuide = (): RoleGuideEntry[] => [
  { role: "Owner", roleTone: "purple", desc: "Full workspace control — billing, seats and deletion." },
  { role: "Admin", roleTone: "blue", desc: "Post and fund projects, manage members and batches." },
  { role: "Reviewer", roleTone: "mint", desc: "QA sampling, batch approvals and re-work queues." },
  { role: "Annotator", roleTone: "orange", desc: "Internal labeling for private, NDA-gated batches." },
];
