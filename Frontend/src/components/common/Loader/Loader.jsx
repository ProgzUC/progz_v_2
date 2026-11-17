import React from 'react';
import './Loader.css';

const Loader = ({ message, inline = false }) => {
    return (
        <div className={`loader-container${inline ? " is-inline" : ""}`} role="status" aria-live="polite">
            <div className="loader-quantum">
              <div></div>
              <div></div>
              <div></div>
            </div>
            {message ? <p className="loader-message">{message}</p> : null}
        </div>
    );
};

export default Loader;
