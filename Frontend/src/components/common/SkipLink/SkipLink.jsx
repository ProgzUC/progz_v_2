import "./SkipLink.css";

const SkipLink = ({ targetId = "main-content", label = "Skip to main content" }) => (
  <a href={`#${targetId}`} className="skip-link">
    {label}
  </a>
);

export default SkipLink;
