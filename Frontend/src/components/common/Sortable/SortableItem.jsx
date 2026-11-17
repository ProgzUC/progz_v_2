import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableItem({ id, children, className = "" }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return children({
    setNodeRef,
    style,
    attributes,
    listeners,
    isDragging,
    className: `${className}${isDragging ? " is-dragging" : ""}`.trim(),
  });
}
