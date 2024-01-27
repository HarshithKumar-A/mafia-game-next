import React, { useEffect } from 'react';
import './button.css';

export default function Button({ text, action, disabled }) {
    useEffect(() => { })
    return (
        <div
            onClick={action}
            className={`d-flex align-items-center justify-content-center bg-white button-style-1 cursor-pointer ${disabled ? 'disabled' : ''}`}
        >
            {text}
        </div>
    );

}
