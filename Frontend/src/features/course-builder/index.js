/**
 * Course builder feature barrel.
 * Domain logic lives here; presentational shells stay in components/common/CourseBuilder.
 */
export { default as CourseBuilder } from "./CourseBuilder";

export {
  emptyCourseState,
  hydrateCourseState,
  validateCourseInformation,
} from "./courseState";

export { buildCoursePayload } from "./coursePayload";

export {
  createId,
  createEmptySection,
  createEmptyModule,
  reorderList,
  withStableIds,
} from "../../utils/courseBuilder";
