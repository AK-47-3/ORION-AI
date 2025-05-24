import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Make sure this path is correct relative to index.js
// If you have an index.css file in src folder, uncomment or add this line:
// import './index.css'; 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
