/**
 * Route screens of this feature, imported only by src/pages. Kept apart from index.ts (the API other
 * features use) so features never import each other's screens and no import cycles form.
 */
export { default as ServicePage } from './components/service-page';
export { default as ServiceDetails } from './components/service-details-page';
