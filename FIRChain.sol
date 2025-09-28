// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
contract FIRChain {
    struct Officer {
        address officerAddress;
        string name;
        string district;
        string station;
    }
    struct FIR {
        address officer;
        string caseTitle;
        string description;
        string accusedName;
        string location;
        string date;
    }
    address public admin;
    Officer[] public officers;
    FIR[] public firs;
    mapping(address => bool) public isOfficer;
    constructor() {
        admin = msg.sender;
    }
    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }
    modifier onlyOfficer() {
        require(isOfficer[msg.sender], "Not officer");
        _;
    }

    function addOfficer(
        address _officer,
        string memory _name,
        string memory _district,
        string memory _station
    ) public onlyAdmin {
        require(!isOfficer[_officer], "Already an officer");
        isOfficer[_officer] = true;
        officers.push(Officer(_officer, _name, _district, _station));
    }

    function submitFIR(
        string memory caseTitle,
        string memory description,
        string memory accusedName,
        string memory location,
        string memory date
    ) public onlyOfficer {
        firs.push(FIR(msg.sender, caseTitle, description, accusedName, location, date));
    }

    function getAllFIRs() public view returns (FIR[] memory) {
        return firs;
    }


    function getAllOfficers() public view returns (Officer[] memory) {
        return officers;
    }

    function getFIRsByOfficer(address _officer) public view returns (FIR[] memory) {
    uint count = 0;
    for (uint i = 0; i < firs.length; i++) {
        if (firs[i].officer == _officer) {
            count++;
        }
    }

    FIR[] memory result = new FIR[](count);
    uint index = 0;

    for (uint i = 0; i < firs.length; i++) {
        if (firs[i].officer == _officer) {
            result[index] = firs[i];
            index++;
        }
    }
    return result;
}
    function getOfficerByAddress(address _officer) public view returns (Officer memory) {
        for (uint i = 0; i < officers.length; i++) {
            if (officers[i].officerAddress == _officer) {
                return officers[i];
            }
        }
        revert("Officer not found");
    }
}
