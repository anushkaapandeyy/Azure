import React, { useState } from "react";
import axios from "axios";
import AdminDashboard from "./AdminDashboard";
import "./App.css";

function App() {
  const [currentView, setCurrentView] = useState('user'); // 'user' or 'admin'
  const [formData, setFormData] = useState({
    email: "",
    subscription: "",
    role: "",
    justification: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3000/api/request", formData);
      alert(`Request submitted successfully! Request ID: ${response.data.id}`);
      // Clear form
      setFormData({
        email: "",
        subscription: "",
        role: "",
        justification: "",
      });
    } catch (error) {
      console.error("Error submitting request", error);
      alert("Error submitting request.");
    }
  };

  if (currentView === 'admin') {
    return (
      <div className="App">
        <nav className="navigation">
          <button onClick={() => setCurrentView('user')}>👤 User Portal</button>
          <button onClick={() => setCurrentView('admin')} className="active">🛡️ Admin Dashboard</button>
        </nav>
        <AdminDashboard />
      </div>
    );
  }

  return (
    <div className="App">
      <nav className="navigation">
        <button onClick={() => setCurrentView('user')} className="active">👤 User Portal</button>
        <button onClick={() => setCurrentView('admin')}>🛡️ Admin Dashboard</button>
      </nav>
      
      <div className="user-portal">
        <h1>🔐 Azure Access Request Form</h1>
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address:</label>
              <input 
                name="email" 
                type="email"
                placeholder="your.email@company.com" 
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Azure Subscription:</label>
              <input 
                name="subscription" 
                placeholder="Production Subscription" 
                value={formData.subscription}
                onChange={handleChange}
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Role Required:</label>
              <select name="role" value={formData.role} onChange={handleChange} required>
                <option value="">Select Role</option>
                <option value="Reader">Reader - View resources only</option>
                <option value="Contributor">Contributor - Manage resources</option>
                <option value="Owner">Owner - Full access (requires special approval)</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Justification:</label>
              <textarea 
                name="justification" 
                placeholder="Please explain why you need this access and for how long..." 
                value={formData.justification}
                onChange={handleChange}
                rows="4"
                required 
              />
            </div>
            
            <button type="submit" className="submit-btn">🚀 Submit Access Request</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
