import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import AddReferrerForm from './AddReferrerForm'; // Import AddReferrerForm
import './statics/AddReferrerDialog.css';

Modal.setAppElement('#root');

const AddReferrerDialog = ({ isOpen, onRequestClose, visit, revenue, onReferrerSelect}) => {
    const [referrers, setReferrers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddReferrerFormOpen, setIsAddReferrerFormOpen] = useState(false); // State to control form visibility
    console.log("visit",visit)

    useEffect(() => {
        if (isOpen) {
            // Fetch referrers from the API or backend
            axios.get(`${process.env.REACT_APP_LOCALHOST}/referrer/list-referrers`)
                .then(response => {
                    setReferrers(response.data);
                })
                .catch(error => {
                    console.error('Error fetching referrers:', error);
                });
        }
    }, [isOpen]);

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const filteredReferrers = referrers.filter(referrer =>
        referrer.name.toLowerCase().includes(searchQuery.toLowerCase())
    );



    // const handleReferrerSelect = async (referrer) => {
    //     const referralData = {
    //         referrer: referrer.id,       // Assuming 'referrer' contains the selected referrer's ID
    //         visit: visit,               // The ID of the selected visit
    //         revenue: parseInt(revenue),             // The revenue for this referral
    //     };

    //     try {
    //         const response = await axios.post('http://localhost:8000/referrer/referrals/', referralData);
    //         console.log("Referral created successfully:", response.data);
            
    //         // You can add additional logic here if needed, such as updating the UI or handling success state
            
    //     } catch (error) {
    //         console.error("Error creating referral:", error.response ? error.response.data : error.message);
    //         // You can handle the error in the UI, such as showing an error message
    //     }

    //     // Close the dialog or perform any cleanup
    //     onRequestClose();
    // };
    const handleReferrerSelect = async (referrer) => {
        const referralData = {
            referrer: referrer.id,       // Send the referrer ID for backend
            visit: visit,               // The ID of the selected visit
            revenue: parseInt(revenue),  // The revenue for this referral
            referrer_name: referrer.name // Pass the referrer name to display
        };
    
        try {
            const response = await axios.post(`${process.env.REACT_APP_LOCALHOST}/referrer/referrals/`, referralData);
            console.log("Referral created successfully:", response.data);
            
            // Update the UI to show the referrer name instead of the ID
            onReferrerSelect(referrer.name); // Assuming you have state to store the selected referrer
        } catch (error) {
            console.error("Error creating referral:", error.response ? error.response.data : error.message);
        }
    
        // Close the dialog or perform any cleanup
        onRequestClose();
    };
    

    const openAddReferrerForm = () => {
        setIsAddReferrerFormOpen(true); // Open the AddReferrerForm modal
    };

    const closeAddReferrerForm = () => {
        setIsAddReferrerFormOpen(false); // Close the AddReferrerForm modal
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            className="modal referrer-modal"
            overlayClassName="overlay"
        >
            <h3>Select the referrer to add</h3>
            <input
                type="text"
                placeholder="Search here for name and ID"
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-input"
            />
            <button className="refresh-button">Refresh</button>
            <div className="scroll-container">
                <ul>
                    {filteredReferrers.map(referrer => (
                        <li key={referrer.id} onClick={() => handleReferrerSelect(referrer)}>
                            {referrer.name}
                        </li>
                    ))}
                </ul>
            </div>
            <button onClick={openAddReferrerForm} className="create-new-button">Create New Referrer</button>
            <button onClick={onRequestClose} className="cancel-button">Cancel</button>

            {isAddReferrerFormOpen && (
                <AddReferrerForm
                    onClose={closeAddReferrerForm}
                    initialData={null} // Pass null since we're creating a new referrer
                />
            )}
        </Modal>
    );
};

export default AddReferrerDialog;