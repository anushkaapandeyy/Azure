import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approverId, setApproverId] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/requests');
      setRequests(response.data.requests);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (!approverId) {
      alert('Please enter your Approver ID');
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/request/approve', {
        requestId,
        approverId
      });
      alert('Request approved successfully!');
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Error approving request');
    }
  };

  const handleReject = async (requestId) => {
    if (!approverId) {
      alert('Please enter your Approver ID');
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/request/reject', {
        requestId,
        approverId,
        rejectionReason
      });
      alert('Request rejected successfully!');
      setRejectionReason('');
      setSelectedRequest(null);
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Error rejecting request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffa500';
      case 'approved': return '#4caf50';
      case 'rejected': return '#f44336';
      default: return '#333';
    }
  };

  if (loading) return <div className="loading">Loading requests...</div>;

  return (
    <div className="admin-dashboard">
      <h1>🛡️ Admin Dashboard - Access Request Management</h1>
      
      <div className="approver-section">
        <label>
          Your Approver ID:
          <input
            type="text"
            value={approverId}
            onChange={(e) => setApproverId(e.target.value)}
            placeholder="Enter your approver ID"
          />
        </label>
      </div>

      <div className="requests-container">
        <h2>Access Requests ({requests.length})</h2>
        
        {requests.length === 0 ? (
          <p>No requests found.</p>
        ) : (
          <div className="requests-grid">
            {requests.map((request) => (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <h3>{request.id}</h3>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(request.status) }}
                  >
                    {request.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="request-details">
                  <p><strong>Email:</strong> {request.email}</p>
                  <p><strong>Subscription:</strong> {request.subscription}</p>
                  <p><strong>Role:</strong> {request.role}</p>
                  <p><strong>Justification:</strong> {request.justification}</p>
                  <p><strong>Requested:</strong> {new Date(request.timestamp).toLocaleString()}</p>
                  
                  {request.status === 'approved' && (
                    <div className="approval-info">
                      <p><strong>Approved by:</strong> {request.approvedBy}</p>
                      <p><strong>Approved at:</strong> {new Date(request.approvedAt).toLocaleString()}</p>
                      {request.simulatedAssignment && (
                        <p className="warning">⚠️ Role assignment was simulated (USER_PRINCIPAL_ID not configured)</p>
                      )}
                      {request.rbacAssignmentFailed && (
                        <p className="error">❌ RBAC assignment failed: {request.rbacError}</p>
                      )}
                    </div>
                  )}
                  
                  {request.status === 'rejected' && (
                    <div className="rejection-info">
                      <p><strong>Rejected by:</strong> {request.rejectedBy}</p>
                      <p><strong>Rejected at:</strong> {new Date(request.rejectedAt).toLocaleString()}</p>
                      <p><strong>Reason:</strong> {request.rejectionReason}</p>
                    </div>
                  )}
                </div>
                
                {request.status === 'pending' && (
                  <div className="action-buttons">
                    <button 
                      className="approve-btn"
                      onClick={() => handleApprove(request.id)}
                    >
                      ✅ Approve
                    </button>
                    <button 
                      className="reject-btn"
                      onClick={() => setSelectedRequest(request.id)}
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {selectedRequest && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Reject Request</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection (optional)"
              rows="4"
            />
            <div className="modal-actions">
              <button onClick={() => handleReject(selectedRequest)}>
                Confirm Rejection
              </button>
              <button onClick={() => setSelectedRequest(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
