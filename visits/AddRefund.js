import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';

Modal.setAppElement('#root');

const AddRefund = ({ isOpen, onRequestClose, visitId, onRefundSuccess, onAddRefund, isRefundButtonVisible, setIsRefundButtonVisible, setTotalRefund, refundAmount }) => {
    const [refundMode, setRefundMode] = useState('Cash');
    const [amount, setAmount] = useState(refundAmount); // Set initial amount to the refundAmount from AddPayment
    const [note, setNote] = useState('');
    const [reason, setReason] = useState('');
    const [isApproveButtonActive, setIsApproveButtonActive] = useState(false);

    useEffect(() => {
        // Update refund amount whenever refundAmount prop changes
        setAmount(refundAmount);
    }, [refundAmount]);

    // Define updateRefundStatus function
    const updateRefundStatus = (visitId, status) => {
        axios.post(`${process.env.REACT_APP_LOCALHOST}/patients/api/update_refund_status/`, { visit_id: visitId, refund_status: status })
            .then(response => {
                if (response.data.status === 'success') {
                    alert('Refund status updated successfully');
                } else {
                    console.error(response.data.message);
                }
            })
            .catch(error => {
                console.error('There was an error updating the refund status!', error);
            });
    };

    // Define handleApprove function
    const handleApprove = () => {
        const refundAmountFloat = parseFloat(refundAmount);  // Convert refundAmount to a float for comparison
        const refundDataAmount = parseFloat(amount);  // Convert entered amount to a float for comparison
    
        // Check if the entered amount matches the expected refundAmount
        if (refundDataAmount !== refundAmountFloat) {
            alert(`You must refund the exact amount of ${refundAmountFloat.toFixed(2)}.`);
            return;  // Prevent approval if the amount is incorrect
        }
    
        axios.post(`${process.env.REACT_APP_LOCALHOST}/patients/api/update_refund_status/`, { visit_id: visitId, refund_status: 'Refunded' })
            .then(response => {
                if (response.data.status === 'success') {
                    setTotalRefund(prev => prev + parseFloat(amount)); // Update totalRefund when the Refund button is clicked
                    setIsRefundButtonVisible(false); // Deactivate the refund button
                    setIsApproveButtonActive(false); // Deactivate the approve button
                    onRequestClose();
                } else {
                    alert('Failed to update refund status');
                }
            })
            .catch(error => {
                console.error('There was an error updating the refund status!', error);
                alert('An error occurred while updating the refund status');
            });
    };
    

    const handleSend = () => {
        const refundAmountFloat = parseFloat(refundAmount);  // Convert refundAmount to a float for comparison
        const refundDataAmount = parseFloat(amount);  // Convert entered amount to a float for comparison
    
        // Check if the entered amount matches the expected refundAmount
        if (refundDataAmount !== refundAmountFloat) {
            alert(`You must refund the exact amount of ${refundAmountFloat.toFixed(2)}.`);
            return;  // Prevent sending the refund if the amount is incorrect
        }
    
        const refundData = {
            visit: visitId,
            refund_mode: refundMode,
            amount: refundDataAmount,
            note: note,
            reason: reason,
            isRefund: true
        };
    
        axios.post(`${process.env.REACT_APP_LOCALHOST}/patients/refunds/`, refundData)
            .then(response => {
                onRefundSuccess(response.data);
                onAddRefund(refundData);
                setIsRefundButtonVisible(true);
                setIsApproveButtonActive(true);
                updateRefundStatus(visitId, 'Initiated');  // Call updateRefundStatus when refund is initiated
            })
            .catch(error => {
                let errorMessage = 'There was an error saving the refund. Please try again.';
                if (error.response) {
                    errorMessage = `Error: ${JSON.stringify(error.response.data)}`;
                } else if (error.request) {
                    errorMessage = 'Error: No response received from the server.';
                } else {
                    errorMessage = `Error: ${error.message}`;
                }
                alert(errorMessage);
            });
    };
    

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} className="payment-modal" overlayClassName="overlay">
            <h3>Add Refund</h3>
            <div className="input-group">
                <label>Refund Mode:</label>
                <select value={refundMode} onChange={(e) => setRefundMode(e.target.value)}>
                <option value="Cheque">Cheque</option>
                     <option value="Credit Card">Credit Card</option>
                     <option value="Debit Card">Debit Card</option>
                     <option value="Google Pay">Google Pay</option>
                     <option value="PhonePe">PhonePe</option>
                     <option value="Amazon Pay">Amazon Pay</option>
                     <option value="Net Banking">Net Banking</option>
                     <option value="UPI">UPI</option>
                     <option value="Other">Other</option>
                </select>
            </div>
            <div className="input-group">
                <label>Amount:</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
            </div>
            <div className="input-group">
                <label>Note:</label>
                <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
            </div>
            <div className="input-group">
                <label>Reason for Refund:</label>
                <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />
            </div>
            <div className="button-container">
                <button onClick={handleSend}>Send</button>
                <button onClick={onRequestClose}>Cancel</button>
                {isApproveButtonActive && (
                    <button onClick={handleApprove}>Refund</button>
                )}
            </div>
        </Modal>
    );
};

export default AddRefund;
