import React from 'react';
import './MyBatchs.css';
import ActiveBatches from './ActiveBatches';

const MyBatchs = ({ onViewDetails }) => {
    return (
        <div className="my-batchs-container">
            <div className="my-batchs-hero">
                <p className="my-batchs-kicker">Trainer workspace</p>
                <h1 className="my-batchs-title">My Batches</h1>
                <p className="my-batchs-subtitle">Open a batch to manage students, unlock sections, or take attendance.</p>
            </div>

            <div className="batches-content">
               

                <ActiveBatches onViewDetails={onViewDetails} />
            </div>
        </div>
    );
};

export default MyBatchs;
