
import React from 'react';
import './statics/DeleteServiceDialog.css';

const DeleteServiceDialog = ({ service, onClose, onDelete }) => {
    const handleDelete = () => {
        onDelete(service);
        onClose();
    };

    return (
        <div className='delete-service-overlay'>
        <div className="delete-service-dialog">
            <p>Are you sure you want to delete this service?</p>
            <div className="dialog-buttons">
                <button onClick={handleDelete}>Yes</button>
                <button onClick={onClose}>No</button>
            </div>
        </div>
        </div>
    );
};

export default DeleteServiceDialog;