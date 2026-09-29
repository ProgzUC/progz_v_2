import { ErrorState } from "../../components/common/PageState";

export default function TrainerStatus({ message, onRetry, onBack, backLabel = "Go back" }) {
    return (
        <ErrorState
            title="We could not load this"
            message={message || "Something went wrong. Try again in a moment."}
            onRetry={onRetry}
            onBack={onBack}
            backLabel={backLabel}
        />
    );
}
