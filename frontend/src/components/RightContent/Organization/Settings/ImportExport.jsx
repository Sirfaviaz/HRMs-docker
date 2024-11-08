import React, { useState } from 'react';
import './ImportExport.css';
import api from '../../../../services/api';

const ImportExport = () => {
    const [selectedFormat, setSelectedFormat] = useState('csv'); // Default to 'csv'
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFormatChange = (e) => {
        setSelectedFormat(e.target.value);
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleDownloadData = async () => {
        if (!selectedFormat) {
            alert("Please select a format.");
            return;
        }

        try {
            setIsLoading(true);
            const response = await api.get(`/import-export/emp-data/?${selectedFormat}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `employees.${selectedFormat}`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Failed to download employee data:", error);
            alert("Failed to download employee data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            setIsLoading(true);
            const response = await api.post(`/import-export/emp-data/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            alert("File uploaded successfully!");
            console.log("Upload response:", response.data);
        } catch (error) {
            console.error("Failed to upload file:", error);
            alert("Failed to upload file. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="import-export-container">
            <div className="section">
                <h3>Export Employee Data</h3>
                <div className="input-group">
                    <label htmlFor="format-select">Select Export Format:</label>
                    <select id="format-select" value={selectedFormat} onChange={handleFormatChange}>
                        <option value="csv">CSV</option>
                        <option value="xls">XLS</option>
                    </select>
                    <button className="button download-button" onClick={handleDownloadData} disabled={isLoading}>
                        {isLoading ? 'Downloading...' : 'Download'}
                    </button>
                </div>
            </div>

            <div className="section">
                <h3>Import Employee Data</h3>
                <p>Only CSV and XLS formats are supported for importing employee data.</p>
                <div className="input-group">
                    <input type="file" onChange={handleFileChange} className="file-input" />
                    <button className="button upload-button" onClick={handleUpload} disabled={isLoading}>
                        {isLoading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportExport;
