import React from 'react';
import Modal from 'react-modal';
import axios from 'axios';

Modal.setAppElement('#root');

const AdminRefund = ({ isOpen, onRequestClose, refundData, onApprove, onReject, visitId }) => {
    const handleApprove = () => {
        axios.post(`${process.env.REACT_APP_LOCALHOST}/patients/api/update_refund_status/`, {
            visit_id: visitId,
            refund_status: 'Approved',
        })
        .then(response => {
            if (response.data.status === 'success') {
                onApprove(response.data.visit);  // Pass the updated visit data to the parent component
            } else {
                console.error('Failed to approve refund:', response.data);
                alert('Failed to approve refund');
            }
        })
        .catch(error => {
            console.error('Error approving refund:', error.response || error.message);
            alert(`An error occurred while approving the refund: ${error.message}`);
        });
    };

    const handleReject = () => {
        axios.post(`${process.env.REACT_APP_LOCALHOST}/patients/api/update_refund_status/`, {
            visit_id: visitId,
            refund_status: 'Rejected',
        })
        .then(response => {
            if (response.data.status === 'success') {
                onReject(response.data.visit);  // Pass the updated visit data to the parent component
            } else {
                console.error('Failed to reject refund:', response.data);
                alert('Failed to reject refund');
            }
        })
        .catch(error => {
            console.error('Error rejecting refund:', error.response || error.message);
            alert(`An error occurred while rejecting the refund: ${error.message}`);
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            className="payment-modal"
            overlayClassName="overlay"
        >
            <h3>Admin Refund</h3>
            {refundData && (
                <div>
                    <p><strong>Refund Mode:</strong> {refundData.refund_mode}</p>
                    <p><strong>Amount:</strong> {refundData.amount}</p>
                    <p><strong>Note:</strong> {refundData.note}</p>
                    <p><strong>Reason:</strong> {refundData.reason}</p>
                </div>
            )}
            <div className="button-container">
                <button onClick={onRequestClose}>Cancel</button>
                <button onClick={handleApprove}>Approve</button>
                <button onClick={handleReject}>Reject</button>
            </div>
        </Modal>
    );
};

export default AdminRefund;
// import React from 'react';
// import Modal from 'react-modal';
// import axios from 'axios';

// Modal.setAppElement('#root');

// const AdminRefund = ({ isOpen, onRequestClose, refundData, onApprove, onReject, visitId, setAdminRefundButtonVisible }) => {
//     const handleApprove = () => {
//         axios.post(`${process.env.REACT_APP_LOCALHOST}/patients/api/update_refund_status/`, {
//             visit_id: visitId,
//             refund_status: 'Approved',
//         })
//         .then(response => {
//             if (response.data.status === 'success') {
//                 onApprove(response.data.visit); // Pass the updated visit data to the parent component
//                 setAdminRefundButtonVisible(false); // Deactivate the Admin Refund button
//             } else {
//                 console.error('Failed to approve refund:', response.data);
//                 alert('Failed to approve refund');
//             }
//         })
//         .catch(error => {
//             console.error('Error approving refund:', error.response || error.message);
//             alert(`An error occurred while approving the refund: ${error.message}`);
//         });
//     };

//     const handleReject = () => {
//         axios.post(`${process.env.REACT_APP_LOCALHOST}/patients/api/update_refund_status/`, {
//             visit_id: visitId,
//             refund_status: 'Rejected',
//         })
//         .then(response => {
//             if (response.data.status === 'success') {
//                 onReject(response.data.visit); // Pass the updated visit data to the parent component
//                 setAdminRefundButtonVisible(false); // Deactivate the Admin Refund button
//             } else {
//                 console.error('Failed to reject refund:', response.data);
//                 alert('Failed to reject refund');
//             }
//         })
//         .catch(error => {
//             console.error('Error rejecting refund:', error.response || error.message);
//             alert(`An error occurred while rejecting the refund: ${error.message}`);
//         });
//     };

//     return (
//         <Modal
//             isOpen={isOpen}
//             onRequestClose={onRequestClose}
//             className="payment-modal"
//             overlayClassName="overlay"
//         >
//             <h3>Admin Refund</h3>
//             {refundData && (
//                 <div>
//                     <p><strong>Refund Mode:</strong> {refundData.refund_mode}</p>
//                     <p><strong>Amount:</strong> {refundData.amount}</p>
//                     <p><strong>Note:</strong> {refundData.note}</p>
//                     <p><strong>Reason:</strong> {refundData.reason}</p>
//                 </div>
//             )}
//             <div className="button-container">
//                 <button onClick={onRequestClose}>Cancel</button>
//                 <button onClick={handleApprove}>Approve</button>
//                 <button onClick={handleReject}>Reject</button>
//             </div>
//         </Modal>
//     );
// };

// export default AdminRefund;
