import React, { useState } from 'react';
import './Settings.css';
import Sidebar from './Settings/Sidebar';
import ImportExport from './Settings/ImportExport';
import UserPermissions from './Settings/UserPermissions';

const Settings = () => {
    const [activeSection, setActiveSection] = useState('General'); // State to track the active section

    const renderContent = () => {
        // Render different content based on the active section
        switch (activeSection) {
            case 'General':
                return <div>General Settings Content</div>;
            case 'Import/Export':
                return <ImportExport />; // Existing Content component for Import/Export
            case 'Base':
                return <UserPermissions/>;
            case 'Help Desk':
                return <div>Help Desk</div>;
            default:
                return <div>Select a section from the sidebar.</div>;
        }
    };

    return (
        <div className="settings-container">
            <Sidebar setActiveSection={setActiveSection} activeSection={activeSection} />
            <div className="main-content">
                {renderContent()}
            </div>
        </div>
    );
};

export default Settings;
