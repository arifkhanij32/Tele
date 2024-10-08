
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import './ImageViewer.css';

const ImageViewer = () => {
    const [isReporting, setIsReporting] = useState(false);
    const navigate = useNavigate();

    const handleBrowsePatientClick = () => {
        navigate('/patient-viewer');
    };

    const handleReportingClick = () => {
        setIsReporting(true);
    };

    const handleEditorChange = (content, editor) => {
        console.log('Content was updated:', content);
    };

    return (
        <div className="image-viewer-container">
            <div className="toolbar">
                <div className="toolbar-section">
                    <button className="toolbar-button" onClick={handleBrowsePatientClick}>
                        <i className="fas fa-folder-open"></i>
                        <span>Browse Patient</span>
                    </button>
                    <button className="toolbar-button" onClick={handleReportingClick}>
                        <i className="fas fa-file-alt"></i>
                        <span>Reporting</span>
                    </button>
                </div>
                <div className="toolbar-section">
                    <button className="toolbar-button">
                        <i className="fas fa-arrows-alt"></i>
                        <span>Move</span>
                    </button>
                    <button className="toolbar-button">
                        <i className="fas fa-search-plus"></i>
                        <span>Zoom</span>
                    </button>
                    <button className="toolbar-button">
                        <i className="fas fa-layer-group"></i>
                        <span>Stack Scroll</span>
                    </button>
                    <button className="toolbar-button">
                        <i className="fas fa-crosshairs"></i>
                        <span>Smart Pointer</span>
                    </button>
                    <button className="toolbar-button">
                        <i className="fas fa-search"></i>
                        <span>Magnifier</span>
                    </button>
                    <button className="toolbar-button">
                        <i className="fas fa-adjust"></i>
                        <span>Windowing</span>
                    </button>
                </div>
            </div>
            {isReporting ? (
                <div className="editor-container">
                    <Editor
                        apiKey="onw9pmkqxsvd5lcqy07cx77qzrwltwp94d9e22ao5vlvh2bw"
                        initialValue="<p>Enter your report here...</p>"
                        init={{
                            menubar: false,
                            toolbar_sticky: true,
                            plugins: [
                                'advlist autolink lists link image charmap print preview anchor',
                                'searchreplace visualblocks code fullscreen',
                                'insertdatetime media table paste code help wordcount'
                            ],
                            toolbar:
                                'undo redo | bold italic underline | forecolor backcolor | ' +
                                'alignleft aligncenter alignright alignjustify | ' +
                                'bullist numlist outdent indent | removeformat | help',
                            content_style: `
                                body { font-size: 14px; }
                                .mce-content-body { font-size: 14px; }
                                .tox-toolbar { padding: 4px; }
                                .tox .tox-toolbar__group { padding: 0; }
                                .tox .tox-button { font-size: 14px; }
                            `,
                        }}
                        onEditorChange={handleEditorChange}
                    />
                </div>
            ) : (
                <div className="image-viewer-content">
                    <p>Image Viewer Content</p>
                </div>
            )}
        </div>
    );
};

export default ImageViewer;