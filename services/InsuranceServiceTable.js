import React, { useState, useEffect } from 'react';
import AddServiceDialog from './AddServiceDialog';
import EditServiceDialog from './EditServiceDialog';
import DeleteServiceDialog from './DeleteServiceDialog';
import './statics/InsuranceServiceTable.css';

const InsuranceServiceTable = ({ services, onAdd, onEdit, onDelete }) => {
    const [isAddDialogOpen, setAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [currentService, setCurrentService] = useState(null);
    const [selectedServiceId, setSelectedServiceId] = useState(null);

    const handleAddService = () => setAddDialogOpen(true);
    useEffect(() => {
        console.log(services);  // Log the services data to check if servicePrice exists
    }, [services]);

    const handleEditService = () => {
        if (currentService) {
            setEditDialogOpen(true);
        }
    };

    const handleDeleteService = () => {
        if (currentService) {
            setDeleteDialogOpen(true);
        }
    };

    const handleRowClick = (service) => {
        if (selectedServiceId === service.id) {
            // Deselect the row if it's already selected
            setSelectedServiceId(null);
            setCurrentService(null);
        } else {
            // Select the row
            setSelectedServiceId(service.id);
            setCurrentService(service);
        }
    };

    return (
        <div className="insurance-service-section">
            <h2 className="insurance-service-header">Insurance Service</h2>
            <div className="insurance-service-table-container">
                <table className="insurance-service-table">
                    <thead>
                        <tr>
                            <th>Service</th>
                            <th>Modality</th>
                            <th>Service Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.map(service => (
                            <tr
                                key={service.id}
                                onClick={() => handleRowClick(service)}
                                className={selectedServiceId === service.id ? 'selected' : ''}
                            >
                                <td>{service.service}</td>
                                <td>{service.modality}</td>
                                <td>{`${service.currency} ${service.service_price}`}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="insurance-service-actions">
                <button onClick={handleAddService}>
                    <i className="fas fa-plus" style={{ marginRight: '8px' }}></i> 
                    Add Service
                </button>
                <button onClick={handleEditService} disabled={!currentService}>
                    <i className="fas fa-edit" style={{ marginRight: '8px' }}></i> 
                    Edit Service
                </button>
                <button onClick={handleDeleteService} disabled={!currentService}>
                    <i className="fas fa-trash" style={{ marginRight: '8px' }}></i> 
                    Delete Service
                </button>
            </div>
            {isAddDialogOpen && <AddServiceDialog onClose={() => setAddDialogOpen(false)} onAdd={onAdd} />}
            {isEditDialogOpen && <EditServiceDialog service={currentService} onClose={() => setEditDialogOpen(false)} onEdit={onEdit} />}
            {isDeleteDialogOpen && <DeleteServiceDialog service={currentService} onClose={() => setDeleteDialogOpen(false)} onDelete={onDelete} />}
        </div>
    );
};

export default InsuranceServiceTable;