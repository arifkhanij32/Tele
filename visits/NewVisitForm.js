import React, { useState } from 'react';
import NewPatientDialog from './NewPatientDialog';
import ExistingPatientDialog from './ExistingPatientDialog';
import SelectOptionDialog from './SelectOptionDialog';
import './statics/NewVisitForm.css';

const Dialog = ({ show, onClose }) => {
    const [showNewPatientDialog, setShowNewPatientDialog] = useState(false);
    const [showExistingPatientDialog, setShowExistingPatientDialog] = useState(false);
    const [showBacksideDialog, setShowBacksideDialog] = useState(false);
    const [initialData, setInitialData] = useState(null);

    const handleToggleExistingPatientDialog = () => {
        setShowExistingPatientDialog(!showExistingPatientDialog);
    };

    const handleOpenNewPatientDialog = () => {
        setShowNewPatientDialog(true);
        setShowExistingPatientDialog(false);
    };

    const handleCloseAllDialogs = () => {
        setShowNewPatientDialog(false);
        setShowExistingPatientDialog(false);
        setShowBacksideDialog(false);
        onClose();
    };

    const handleDialogClick = (e) => {
        e.stopPropagation();
    };

    const handleEdit = (patientData) => {
        setInitialData(patientData);
        setShowNewPatientDialog(true);
        setShowExistingPatientDialog(false);
    };

    if (!show) {
        return null;
    }

    return (
        <>
            <div className="newVisitFormOverlay"></div>
            <div className="newVisitFormDialog smallDialog" onClick={handleDialogClick}>
                <button className="newVisitFormCloseButton" onClick={handleCloseAllDialogs}>X</button>
                <h2>Please select patient</h2>
                <div className="buttons">
                    <button onClick={handleOpenNewPatientDialog}>Create New Patient</button>
                    <button onClick={handleToggleExistingPatientDialog}>Existing Patient</button>
                </div>
                {showExistingPatientDialog && (
                    <div className="childDialogOverlay" onClick={handleDialogClick}>
                        <ExistingPatientDialog show={showExistingPatientDialog} onClose={handleCloseAllDialogs} onEdit={handleEdit} />
                    </div>
                )}
                {showNewPatientDialog && (
                    <div className={`childDialogOverlay ${showBacksideDialog ? 'hidden' : ''}`} onClick={handleDialogClick}>
                        <NewPatientDialog
                            show={showNewPatientDialog}
                            onClose={handleCloseAllDialogs}
                            setShowBacksideDialog={setShowBacksideDialog}
                            initialData={initialData}
                        />
                    </div>
                )}
                {showBacksideDialog && (
                    <div className="childDialogOverlay" onClick={handleDialogClick}>
                        <SelectOptionDialog show={showBacksideDialog} onClose={handleCloseAllDialogs} />
                    </div>
                )}
            </div>
        </>
    );
};

export default Dialog;