import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Navigation from './components/Navigation';
import VisitsTable from './components/visits/VisitsTable';
import PatientViewer from './components/patientViewer/PatientViewer';
import ImageViewer from './components/ImageViewer/ImageViewer.js';
import ServiceTable from './components/services/ServiceTable';
import AdvancedDashboard from './components/AdvancedDashboard/AdvancedDashboard';
import ReferrerList from './components/ReferrerLists/ReferrerList.js';
import DicomWorklists from './components/DicomWorklists/DicomWorklists';
import DicomNodesPage from './components/DicomNodes/DicomNodes';
import Users from './components/Users/Users';
import '@fortawesome/fontawesome-free/css/all.min.css';





function App() {
    return (
        <Router>
            <div className="App">
                <Navigation />
                <Routes>
                    <Route path="/" element={<VisitsTable />} />
                    <Route path="/patient-viewer" element={<PatientViewer />} />
                    <Route path="/image-viewer/:id" element={<ImageViewer />} />
                    <Route path="/services" element={<ServiceTable />} />
                    <Route path="/referrers" element={<ReferrerList />} />
                    <Route path="/advancedDashboard" element={<AdvancedDashboard />} />                  
                    <Route path="/dicomWorklists" element={<DicomWorklists />} />
                    <Route path="/dicomNodes" element={<DicomNodesPage />} />
                    <Route path="/users" element={<Users />} />       
                </Routes>
            </div>
        </Router>
    );
}

export default App;