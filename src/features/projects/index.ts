/**
 * Public API of the projects feature (company project requests, demo projects and the order pipeline): Redux state,
 * data helpers and types other features use (lab, dashboards). Route screens are in screens.ts.
 */

// Redux: project requests and the wizard draft
export {
  projectsReducer,
  projectsPersistence,
  selectPostedProjects,
  selectPostedProject,
  postProjectRequest,
  changeRequestStatus,
  attachRequestProposal,
} from './store/projects-slice';
export type { ProjectsState, ProjectsRootState } from './store/projects-slice';
export { requestDraftReducer, requestDraftPersistence, selectRequestDraft, draftSaved, draftCleared } from './store/request-draft-slice';
export type { RequestDraftState, RequestDraftRootState } from './store/request-draft-slice';

export { REQUEST_ACTIONS, buildProposal, budgetLabel, formatDate } from './data/project-store';
export type { ProposalInput } from './data/project-store';
export { getCompanyProjects, getProjectById, getProjectStatus, getProjectTeam } from './data/company-projects';
export { getCompanyOrders, getCompanyOrderDetail, ORDER_PIPELINE } from './data/company-orders';

export type {
  CompanyProject,
  PostedProject,
  ProjectTeam,
  ProposalDoc,
  RequestActionSet,
  SeededProject,
  StatusStep,
  Tone,
} from './types/project';
export type { CompanyOrder, OrderDetail, TimelineStep } from './types/order';
