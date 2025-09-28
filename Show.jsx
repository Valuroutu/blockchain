import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import ContractABI from "../../contracts/votingContract.json";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // update if redeployed

const Show = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [isElectionCommissioner, setIsElectionCommissioner] = useState(false);
  const [electionStarted, setElectionStarted] = useState(false);
  const [electionEnded, setElectionEnded] = useState(false);
  const [startTimestamp, setStartTimestamp] = useState("");

  const [candidateName, setCandidateName] = useState("");
  const [candidateAge, setCandidateAge] = useState("");
  const [candidateParty, setCandidateParty] = useState("");
  const [candidateGender, setCandidateGender] = useState("");
  const [candidateAddress, setCandidateAddress] = useState("");

  const [voterName, setVoterName] = useState("");
  const [voterAge, setVoterAge] = useState("");
  const [voterGender, setVoterGender] = useState("");

  const [selectedCandidateId, setSelectedCandidateId] = useState(0);
  const [candidates, setCandidates] = useState([]);
  const [voters, setVoters] = useState([]);

  useEffect(() => {
    connectWallet();
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("MetaMask not detected");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setCurrentAccount(address);

      const contractInstance = new ethers.Contract(
        contractAddress,
        ContractABI.abi,
        signer
      );
      setContract(contractInstance);

      const commissioner = await contractInstance.electionCommissioner();
      setIsElectionCommissioner(
        commissioner.toLowerCase() === address.toLowerCase()
      );

      await refreshData(contractInstance);
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  };

  const refreshData = async (contractInstance) => {
    try {
      const status = await contractInstance.votingStatus();
      setElectionStarted(status === "Voting is currently open.");
      setElectionEnded(status === "Voting has ended.");

      const candList = await contractInstance.CandidateList();
      setCandidates(candList);

      const voterList = await contractInstance.VoterList();
      setVoters(voterList);
    } catch (err) {
      console.error("Error refreshing data:", err);
    }
  };

  // --- Start Election (robust datetime parsing) ---
  const startElection = async () => {
    if (!contract) return alert("Contract not loaded");
    if (!startTimestamp) return alert("Please select a valid start time");

    try {
      // Split date and time manually
      const [datePart, timePart] = startTimestamp.split("T");
      if (!datePart || !timePart) return alert("Invalid datetime format");

      const [year, month, day] = datePart.split("-").map(Number);
      const [hours, minutes] = timePart.split(":").map(Number);

      const startTimeMs = new Date(year, month - 1, day, hours, minutes).getTime();
      if (isNaN(startTimeMs)) return alert("Invalid date or time");

      const startTime = Math.floor(startTimeMs / 1000); // convert to seconds

      const tx = await contract.voteTime(startTime);
      await tx.wait();
      await refreshData(contract);
      alert("Election started successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // --- Emergency Stop ---
  const emergencyStopHandler = async () => {
    if (!contract) return alert("Contract not loaded");
    try {
      const tx = await contract.emergencyStop();
      await tx.wait();
      await refreshData(contract);
      alert("Voting stopped!");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // --- Candidate Registration ---
  const candidateSubmit = async (e) => {
    e.preventDefault();
    if (!contract) return alert("Contract not loaded");

    if (!candidateName || !candidateAge || !candidateParty || !candidateGender || !candidateAddress) {
      return alert("All candidate fields are required!");
    }
    if (Number(candidateAge) < 18) return alert("Candidate must be at least 18 years old");
    if (!ethers.isAddress(candidateAddress)) return alert("Invalid Ethereum address");

    try {
      const tx = await contract.candidateRegistration(
        candidateName,
        Number(candidateAge),
        candidateParty,
        candidateGender,
        candidateAddress
      );
      await tx.wait();
      await refreshData(contract);
      alert("Candidate registered successfully!");

      setCandidateName("");
      setCandidateAge("");
      setCandidateParty("");
      setCandidateGender("");
      setCandidateAddress("");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // --- Voter Registration ---
  const voterSubmit = async (e) => {
    e.preventDefault();
    if (!contract) return alert("Contract not loaded");

    if (!voterName || !voterAge || !voterGender) {
      return alert("All voter fields are required!");
    }
    if (Number(voterAge) < 18) return alert("Voter must be at least 18 years old");

    try {
      const tx = await contract.voterRegistration(
        voterName,
        Number(voterAge),
        voterGender
      );
      await tx.wait();
      await refreshData(contract);
      alert("Voter registered successfully!");

      setVoterName("");
      setVoterAge("");
      setVoterGender("");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // --- Cast Vote ---
  const castVote = async () => {
    if (!contract) return alert("Contract not loaded");
    if (selectedCandidateId <= 0) return alert("Please select a candidate to vote");

    try {
      const tx = await contract.castVote(selectedCandidateId);
      await tx.wait();
      await refreshData(contract);
      alert("Vote cast successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // --- Determine Winner ---
  const determineWinner = async () => {
    if (!contract) return alert("Contract not loaded");
    try {
      const tx = await contract.DetermineWinner();
      await tx.wait();
      const winnerAddress = await contract.winner();
      alert("Winner Address: " + winnerAddress);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div>
      <h1>Decentralized Voting DApp</h1>
      <p>Connected Account: {currentAccount}</p>

      {isElectionCommissioner && (
        <div>
          <h2>Commissioner Panel</h2>
          <input
            type="datetime-local"
            onChange={(e) => setStartTimestamp(e.target.value)}
          />
          <button onClick={startElection}>Start Election</button>
          <button onClick={emergencyStopHandler}>Emergency Stop</button>
          <button onClick={determineWinner}>Determine Winner</button>
        </div>
      )}

      {isElectionCommissioner && (
        <div>
          <h2>Register Candidate</h2>
          <form onSubmit={candidateSubmit}>
            <input
              type="text"
              placeholder="Name"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Age"
              value={candidateAge}
              onChange={(e) => setCandidateAge(e.target.value)}
              required
              min={18}
            />
            <input
              type="text"
              placeholder="Party"
              value={candidateParty}
              onChange={(e) => setCandidateParty(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Gender"
              value={candidateGender}
              onChange={(e) => setCandidateGender(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Candidate Address"
              value={candidateAddress}
              onChange={(e) => setCandidateAddress(e.target.value)}
              required
            />
            <button type="submit">Register Candidate</button>
          </form>
        </div>
      )}

      <h2>Register Voter</h2>
      <form onSubmit={voterSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={voterName}
          onChange={(e) => setVoterName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Age"
          value={voterAge}
          onChange={(e) => setVoterAge(e.target.value)}
          required
          min={18}
        />
        <input
          type="text"
          placeholder="Gender"
          value={voterGender}
          onChange={(e) => setVoterGender(e.target.value)}
          required
        />
        <button type="submit">Register Voter</button>
      </form>

      <h2>Cast Vote</h2>
      <select
        value={selectedCandidateId}
        onChange={(e) => setSelectedCandidateId(Number(e.target.value))}
      >
        <option value={0}>Select Candidate</option>
        {candidates.map((c) => (
          <option key={c.candidate_id} value={Number(c.candidate_id)}>
            {c.name} ({c.party})
          </option>
        ))}
      </select>
      <button onClick={castVote}>Vote</button>

      <h2>Candidate List</h2>
      <ul>
        {candidates.map((c, idx) => (
          <li key={idx}>
            {c.name} ({c.party}) - Votes: {Number(c.voteCount)}
          </li>
        ))}
      </ul>

      <h2>Voter List</h2>
      <ul>
        {voters.map((v, idx) => (
          <li key={idx}>
            {v.name} (ID: {v.voter_id}) - Voted: {v.hasVoted ? "Yes" : "No"}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Show;
