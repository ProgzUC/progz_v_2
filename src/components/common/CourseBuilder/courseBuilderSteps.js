export const COURSE_BUILDER_STEPS = [
  {
    id: "information",
    label: "Course Information",
    icon: "bi-info-circle",
    subtitle: "Details and settings for your course",
  },
  {
    id: "curriculum",
    label: "Curriculum",
    icon: "bi-book",
    subtitle: "Build modules and sections for your course",
  },
];

export const getStepMeta = (stepId) =>
  COURSE_BUILDER_STEPS.find((s) => s.id === stepId) ?? COURSE_BUILDER_STEPS[0];
