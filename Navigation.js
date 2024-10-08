import React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
    return (
        <nav className="navigation">
            <ul>
                <li><Link to="/">Visits</Link></li>
                <li><Link to="/patient-viewer">Patient Viewer</Link></li>
                <li><Link to="/services">Services</Link></li>
                <li><Link to="/referrers">Referrers</Link></li>
                <li><Link to="/advancedDashboard">Advanced Dashboard</Link></li>
                <li><Link to="/dicomWorklists">Dicom Worklists</Link></li>
                <li><Link to="dicomNodes">Dicom Nodes</Link></li>
                <li><Link to="/users">Users</Link></li>
            </ul>
        </nav>
    );
};

export default Navigation;