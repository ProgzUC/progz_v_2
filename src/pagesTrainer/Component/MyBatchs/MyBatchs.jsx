import React from 'react';
import './MyBatchs.css';
import batchesData from './batchesData.json';
import ActiveBatches from './ActiveBatches';

const MyBatchs = ({ onViewDetails }) => {
    return (
        <div className="my-batchs-container">
            <div className="my-batchs-hero">
                <h3 className="my-batchs-title">View all your assigned batches in one place.</h3>
                <p className="my-batchs-subtitle">Everything You Need to Run Your Classes Smoothly</p>
            </div>

            <div className="batches-content">
               

                <ActiveBatches onViewDetails={onViewDetails} />
            </div>
        </div>
    );
};

export default MyBatchs;
