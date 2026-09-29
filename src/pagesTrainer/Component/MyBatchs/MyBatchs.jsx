import React from 'react';
import './MyBatchs.css';
import ActiveBatches from './ActiveBatches';

const MyBatchs = () => {
    return (
        <div className="tb-page">
            <section className="tb-hero">
                <div className="tb-hero-copy">
                    <p className="tb-kicker">
                        <span className="tb-kicker-dot" aria-hidden="true" />
                        Trainer workspace
                    </p>
                    <h1>Every batch, ready to teach.</h1>
                    <p className="tb-lead">
                        Open a class, unlock the next section, and take attendance without leaving this page.
                    </p>
                </div>
            </section>

            <ActiveBatches />
        </div>
    );
};

export default MyBatchs;
