import { useEffect, useState } from "react";
import { ethers } from "ethers";
import FIRContract from "./contracts/FIRChain.json"; 
import "./App.css"; 
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOfficer, setIsOfficer] = useState(false);

  // Admin inputs
  const [officerAddress, setOfficerAddress] = useState("");
  const [name, setName] = useState("");
  const [district, setDistrict] = useState("");
  const [station, setStation] = useState("");

  // Officer FIR inputs
  const [caseTitle, setCaseTitle] = useState("");
  const [description, setDescription] = useState("");
  const [accusedName, setAccusedName] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [allFIRs, setAllFIRs] = useState([]);

  useEffect(() => {
    connectWallet();
  }, []);

  const connectWallet = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setCurrentAccount(address);

      const firContract = new ethers.Contract(contractAddress, FIRContract.abi, signer);
      setContract(firContract);

      const admin = await firContract.admin();
      setIsAdmin(address.toLowerCase() === admin.toLowerCase());

      const isOfficer = await firContract.isOfficer(address);
      setIsOfficer(isOfficer);
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  };

  const addOfficer = async () => {
    try {
      const tx = await contract.addOfficer(officerAddress, name, district, station);
      await tx.wait();
      alert("Officer added successfully!");
      setOfficerAddress("");
      setName("");
      setDistrict("");
      setStation("");
    } catch (error) {
      console.error("Failed to add officer", error);
      alert("Failed to add officer: " + error.message);
    }
  };

  const submitFIR = async () => {
    try {
      const tx = await contract.submitFIR(caseTitle, description, accusedName, location, date);
      await tx.wait();
      alert("FIR filed successfully!");
      setCaseTitle("");
      setDescription("");
      setAccusedName("");
      setLocation("");
      setDate("");
    } catch (error) {
      console.error("Error submitting FIR:", error);
      alert("Error submitting FIR: " + error.message);
    }
  };

  const getAllFIRs = async () => {
    try {
      const firs = await contract.getAllFIRs();
      setAllFIRs(firs);
    } catch (error) {
      console.error("Error fetching FIRs:", error);
      alert("Failed to fetch FIRs: " + error.message);
    }
  };

  return (
    <div className="app">
      <h1>FIRChain :Decentralized FIR Filing System</h1>
      <p><strong>Connected Wallet:</strong> {currentAccount}</p>

      {isAdmin && (
        <div className="card">
          <h2>Admin Panel: Add New Officer</h2>
          <input
            type="text"
            placeholder="Officer Address"
            value={officerAddress}
            onChange={(e) => setOfficerAddress(e.target.value)}
          />
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="District"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          />
          <input
            type="text"
            placeholder="Station"
            value={station}
            onChange={(e) => setStation(e.target.value)}
          />
          <button onClick={addOfficer}>Add Officer</button><br/>
          <button onClick={getAllFIRs}>get AllFIRs</button>
        </div>
      )}

      {isOfficer && (
        <div className="card">
          <h2>Officer Panel: File New FIR</h2>
          <input
            type="text"
            placeholder="Case Title"
            value={caseTitle}
            onChange={(e) => setCaseTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="text"
            placeholder="Accused Name"
            value={accusedName}
            onChange={(e) => setAccusedName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <input
            type="text"
            placeholder="Date (e.g., 2025-08-07)"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button onClick={submitFIR}>Submit FIR</button>

          <h3>All Filed FIRs</h3>
          <button onClick={getAllFIRs}>Load FIRs</button>
          <ul className="firs">
            {allFIRs.map((fir, index) => (
              <li key={index} className="fir-item">
                <p><strong>Case Title:</strong> {fir.caseTitle}</p>
                <p><strong>Description:</strong> {fir.description}</p>
                <p><strong>Accused:</strong> {fir.accusedName}</p>
                <p><strong>Location:</strong> {fir.location}</p>
                <p><strong>Date:</strong> {fir.date}</p>
                <p><strong>Officer:</strong> {fir.officer}</p>
              </li>
            ))}
          </ul>
        </div>
        
      )}
      {!isAdmin && !isOfficer && (
        <div className="card">
        <p className="notice">You are a public user. You can only view FIRs.</p>

        <h2>All Filed FIRs</h2>
        <button onClick={getAllFIRs}>Load FIRs</button>
        <ul className="firs">
        {allFIRs.map((fir, index) => (
          <li key={index} className="fir-item">
          <p><strong>Case Title:</strong> {fir.caseTitle}</p>
          <p><strong>Description:</strong> {fir.description}</p>
          <p><strong>Accused:</strong> {fir.accusedName}</p>
          <p><strong>Location:</strong> {fir.location}</p>
          <p><strong>Date:</strong> {fir.date}</p>
          <p><strong>Officer:</strong> {fir.officer}</p>
          </li>
          ))}
          </ul>
          </div>
          )}

      

      
    </div>
  );
}

export default App;
