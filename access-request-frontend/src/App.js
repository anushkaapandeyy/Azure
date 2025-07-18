import React, {useState} from "react";
import axios from "axios"

function App(){
  const [formData, setFormData] = useState({
    email: "",
    subscription: "",
    role: "",
    justification: "",
  });
  const handleChange = (e) => {
  setFormData({...formData, [e.target.name]: e.target.value});
};
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/api/request", formData);
      alert("Request submitted successfully!");
    } catch (error) {
      console.error("Error submitting request", error);
      alert("Error submitting request.");
    }
  };
  return (
    <div className="App">
      <h1>Azure Access Request Form</h1>
      <form onSubmit={handleSubmit}>
        <input name="email" placeholder="Your Email" onChange={handleChange} />
        <input name="subscription" placeholder="Subscription Name" onChange={handleChange} />
        <select name="role" onChange={handleChange}>
          <option value="">Select Role</option>
          <option value="Reader">Reader</option>
          <option value="Contributor">Contributor</option>
        </select>
        <textarea name="justification" placeholder="Why do you need access?" onChange={handleChange} />
        <button type="submit">Submit Request</button>
      </form>
    </div>
  );
 
}
export default App;