// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        string name;
        uint age;
        string party;
        string gender;
        uint candidate_id;
        address candidate_address;
        uint voteCount;
    }

    mapping(uint => Candidate) public candidates;

    struct Voter {
        string name;
        uint age;
        string gender;
        uint voter_id;
        address voter_address;
        bool hasVoted;
        uint VotedCandidateId;
    }

    mapping(uint => Voter) public voters;

    address public electionCommissioner;
    address public winner;

    uint nextCandidateId = 1;
    uint nextVoterId = 1;
    uint startTime;
    uint endTime;
    bool stopVoting = false;

    constructor() {
        electionCommissioner = msg.sender;
    }

    modifier onlyCommissioner() {
        require(msg.sender == electionCommissioner, "Only the election commissioner can call this function.");
        _;
    }

    modifier votingOpen() {
        require((block.timestamp >= startTime && block.timestamp <= endTime) && stopVoting != true, "Voting is not open.");
        _;
    }

    modifier votingClosed() {
        require(block.timestamp > endTime || stopVoting == true, "Voting is still open.");
        _;
    }

    // ✅ Candidate registration now only allowed by Commissioner
    function candidateRegistration(
        string memory _name,
        uint _age,
        string memory _party,
        string memory _gender,
        address _candidateAddress
    ) public onlyCommissioner {
        require(_age >= 18, "Candidate must be at least 18 years old.");
        require(candidateVerification(_candidateAddress), "Candidate already registered.");
        require(nextCandidateId <= 3, "Maximum number of candidates reached.");

        candidates[nextCandidateId] = Candidate({
            name: _name,
            age: _age,
            party: _party,
            gender: _gender,
            candidate_id: nextCandidateId,
            candidate_address: _candidateAddress,
            voteCount: 0
        });

        nextCandidateId++;
    }

    function candidateVerification(address _candidateAddress) public view returns (bool) {
        for (uint i = 1; i < nextCandidateId; i++) {
            if (candidates[i].candidate_address == _candidateAddress) {
                return false;
            }
        }
        return true;
    }

    function voterRegistration(string memory _name, uint _age, string memory _gender) public {
        require(_age >= 18, "Voter must be at least 18 years old.");
        require(voterVerification(msg.sender), "Voter already registered.");

        voters[nextVoterId] = Voter({
            name: _name,
            age: _age,
            gender: _gender,
            voter_id: nextVoterId,
            voter_address: msg.sender,
            hasVoted: false,
            VotedCandidateId: 0
        });

        nextVoterId++;
    }

    function voterVerification(address _voterAddress) public view returns (bool) {
        for (uint i = 1; i < nextVoterId; i++) {
            if (voters[i].voter_address == _voterAddress) {
                return false;
            }
        }
        return true;
    }

    function CandidateList() public view returns (Candidate[] memory) {
        Candidate[] memory candidateList = new Candidate[](nextCandidateId - 1);
        for (uint i = 1; i < nextCandidateId; i++) {
            candidateList[i - 1] = candidates[i];
        }
        return candidateList;
    }

    function VoterList() public view returns (Voter[] memory) {
        Voter[] memory voterList = new Voter[](nextVoterId - 1);
        for (uint i = 1; i < nextVoterId; i++) {
            voterList[i - 1] = voters[i];
        }
        return voterList;
    }

    function voteTime(uint _startTime) public onlyCommissioner {
        startTime = _startTime;
        endTime = _startTime + 7 days;
        stopVoting = false;
    }

    function votingStatus() public view returns (string memory) {
        if (startTime == 0) return "Voting has not started yet.";
        if (block.timestamp >= startTime && block.timestamp <= endTime && stopVoting == false) return "Voting is currently open.";
        return "Voting has ended.";
    }

    function castVote(uint _candidate_id) public votingOpen {
        require(_candidate_id > 0 && _candidate_id < nextCandidateId, "Invalid candidate ID.");
        uint voterId = voterIdByAddress(msg.sender);
        require(voterId != 0, "Voter is not registered.");
        require(!voters[voterId].hasVoted, "Voter has already voted.");

        voters[voterId].hasVoted = true;
        voters[voterId].VotedCandidateId = _candidate_id;
        candidates[_candidate_id].voteCount++;
    }

    function voterIdByAddress(address _voterAddress) internal view returns (uint) {
        for (uint i = 1; i < nextVoterId; i++) {
            if (voters[i].voter_address == _voterAddress) return voters[i].voter_id;
        }
        return 0;
    }

    function emergencyStop() public onlyCommissioner {
        stopVoting = true;
    }

    function DetermineWinner() public onlyCommissioner votingClosed {
        uint highestVotes = 0;
        uint winningCandidateId = 0;

        for (uint i = 1; i < nextCandidateId; i++) {
            if (candidates[i].voteCount > highestVotes) {
                highestVotes = candidates[i].voteCount;
                winningCandidateId = i;
            }
        }

        if (winningCandidateId != 0) winner = candidates[winningCandidateId].candidate_address;
    }
}
