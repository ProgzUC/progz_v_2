import { useId } from "react";
import { useFocusTrap } from "../../../hooks/useFocusTrap";
import "./AccessibleModal.css";

const AccessibleModal = ({
  isOpen,
  onClose,
  title,
  children,
  className = "modal-box",
  labelledBy,
}) => {
  const generatedTitleId = useId();
  const titleId = labelledBy || (title ? generatedTitleId : undefined);
  const trapRef = useFocusTrap(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        ref={trapRef}
        className={className}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        {title ? <h3 id={titleId}>{title}</h3> : null}
        {children}
      </div>
    </div>
  );
};

export default AccessibleModal;
