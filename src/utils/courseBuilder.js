import { isHtmlEmpty } from "../components/common/RichTextEditor/richTextUtils";

export const createId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const createEmptySection = (overrides = {}) => ({
  id: createId(),
  title: "",
  lessonType: "Theory",
  expanded: false,
  materialFiles: [],
  notes: "",
  challengeFiles: [],
  challengeInstructions: "",
  videos: [],
  ...overrides,
});

/** True when a section has task instructions or task files (new or saved). */
export const sectionHasTask = (section) => {
  if (!section) return false;
  if (!isHtmlEmpty(section.challengeInstructions)) return true;
  if ((section.challengeFiles || []).length > 0) return true;
  if ((section.savedChallengeFiles || []).length > 0) return true;
  return false;
};

export const createEmptyModule = (overrides = {}) => ({
  id: createId(),
  title: "",
  sections: [createEmptySection()],
  ...overrides,
});

export const reorderList = (list, startIndex, endIndex) => {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export const withStableIds = (modules = []) =>
  modules.map((mod) => ({
    ...mod,
    id: mod.id || createId(),
    sections: (mod.sections || []).map((sec) => ({
      ...sec,
      id: sec.id || createId(),
    })),
  }));
