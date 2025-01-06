// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./DonationToken.sol";

contract CharityPlatform is ReentrancyGuard, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant CHARITY_ROLE = keccak256("CHARITY_ROLE");

    DonationToken public donationToken;
    
    struct Project {
        uint256 id;
        string name;
        address charityAddress;
        uint256 goalAmount;
        uint256 raisedAmount;
        bool isActive;
        uint256[] milestones;
        mapping(address => uint256) donations;
    }

    struct Milestone {
        uint256 id;
        uint256 projectId;
        string description;
        uint256 targetAmount;
        uint256 raisedAmount;
        bool isCompleted;
        bool fundsReleased;
        mapping(address => uint256) donations;
    }

    mapping(uint256 => Project) public projects;
    mapping(uint256 => Milestone) public milestones;
    uint256 public projectCount;
    uint256 public milestonesCount;

    event ProjectCreated(uint256 indexed projectId, string name, address charityAddress);
    event DonationReceived(uint256 indexed projectId, address indexed donor, uint256 amount);
    event MilestoneCompleted(uint256 milestoneIndex);
    event FundsReleased(uint256 indexed projectId, uint256 amount);
    event RefundIssued(uint256 indexed projectId, address indexed donor, uint256 amount);

    constructor(address _donationToken) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        donationToken = DonationToken(_donationToken);
    }

    function createProject(
        address _address,
        string memory _name,
        uint256 _goalAmount,
        string[] memory _milestoneDescriptions,
        uint256[] memory _milestoneTargets
    ) external onlyRole(CHARITY_ROLE) {
        require(_milestoneDescriptions.length == _milestoneTargets.length, "Milestone arrays must match");
        
        projectCount++;
        Project storage project = projects[projectCount];
        project.name = _name;
        project.charityAddress = _address;
        project.goalAmount = _goalAmount;
        project.isActive = true;

        for(uint i = 0; i < _milestoneDescriptions.length; i++) {
            createMilestone(_milestoneDescriptions[i], _milestoneTargets[i], projectCount);
        }

        emit ProjectCreated(projectCount, _name, _address);
    }

    function createMilestone(
        string memory _description,
        uint256 _targetAmount,
        uint256 _projectId
    ) internal onlyRole(CHARITY_ROLE) {
        milestonesCount++;
        Milestone storage milestone = milestones[milestonesCount];
        milestone.id = milestonesCount;
        milestone.projectId = _projectId;
        milestone.description = _description;
        milestone.targetAmount = _targetAmount;
        milestone.raisedAmount = 0;
        milestone.isCompleted = false;
        milestone.fundsReleased = false;
        Project storage project = projects[_projectId];
        project.milestones.push(milestonesCount);
    }

    function donate(uint256 _projectId, uint256 _milestoneId, address _donor, address _recipient) external payable nonReentrant {
        Project storage project = projects[_projectId];
        require(project.isActive, "Project is not active");
        require(msg.value > 0, "Donation amount must be greater than 0");
        address payable recipient = payable(_recipient); 
        bool success = recipient.send(msg.value);
        require(success, "Ether transfer failed");
        project.donations[_donor] += msg.value;
        project.raisedAmount += msg.value;
        donationToken.mint(_donor, _projectId, msg.value);

        uint256 milestoneProjectIndex = project.milestones[_milestoneId];
        Milestone storage milestone = milestones[milestoneProjectIndex];
        milestone.donations[_donor] += msg.value;
        milestone.raisedAmount += msg.value;

        emit DonationReceived(_projectId, _donor, msg.value);

        if (milestone.raisedAmount == milestone.targetAmount && !milestone.isCompleted) {
            completeMilestone(milestone.id);
        }
    }

    function completeMilestone(uint256 _milestoneIndex) internal {
        Milestone storage milestone = milestones[_milestoneIndex];
        require(!milestone.isCompleted, "Milestone already completed");
        
        milestone.isCompleted = true;
        emit MilestoneCompleted(_milestoneIndex);
    }

    function requestRefund(uint256 _projectId) external nonReentrant {
        Project storage project = projects[_projectId];
        require(!project.isActive, "Project is still active");
        
        uint256 donationAmount = project.donations[msg.sender];
        require(donationAmount > 0, "No donation found");

        project.donations[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: donationAmount}("");
        require(success, "Refund transfer failed");

        emit RefundIssued(_projectId, msg.sender, donationAmount);
    }

    function deactivateProject(uint256 _projectId) external onlyRole(ADMIN_ROLE) {
        Project storage project = projects[_projectId];
        require(project.isActive, "Project already inactive");
        project.isActive = false;
    }

    // Administrative functions
    function addCharity(address _charityAddress) external onlyRole(ADMIN_ROLE) {
        _grantRole(CHARITY_ROLE, _charityAddress);
    }

    function removeCharity(address _charityAddress) external onlyRole(ADMIN_ROLE) {
        revokeRole(CHARITY_ROLE, _charityAddress);
    }

    // View functions
    function getProject(uint256 _projectId) external view returns (
        string memory name,
        address charityAddress,
        uint256 goalAmount,
        uint256 raisedAmount,
        bool isActive,
        uint256 milestoneCount
    ) {
        Project storage project = projects[_projectId];
        return (
            project.name,
            project.charityAddress,
            project.goalAmount,
            project.raisedAmount,
            project.isActive,
            project.milestones.length
        );
    }

    function getProjectDonations(uint256 _projectId, address _donor) external view returns (
        uint256 donorAmount
    ) {
        Project storage project = projects[_projectId];
        uint256 amount = project.donations[_donor];
        return (
            amount
        );
    }

    function getProjects() external view returns (
        string[] memory name,
        address[] memory charityAddress,
        uint256[] memory goalAmount,
        uint256[] memory raisedAmount,
        bool[] memory isActive,
        uint256[] memory milestoneCount
    ) {
        string[] memory allNames = new string[](projectCount);
        address[] memory allCharityAddreses = new address[](projectCount);
        uint256[] memory allGoalAmounts = new uint256[](projectCount);
        uint256[] memory allRaisedAmounts = new uint256[](projectCount);
        bool[] memory areActive = new bool[](projectCount);
        uint256[] memory milestoneCounts = new uint256[](projectCount);
        for (uint i = 0; i < projectCount; i++) {
            allNames[i] = projects[i].name;
            allCharityAddreses[i] = projects[i].charityAddress;
            allGoalAmounts[i] = projects[i].goalAmount;
            allRaisedAmounts[i] = projects[i].raisedAmount;
            areActive[i] = projects[i].isActive;
            milestoneCounts[i] = projects[i].milestones.length;
        }
        return (
            allNames, 
            allCharityAddreses, 
            allGoalAmounts,
            allRaisedAmounts,
            areActive,
            milestoneCounts
        );
    }

    function getMyDonationProjectIds(address _donor) external view returns (
        uint256[] memory id
    ) {     
        uint256[] memory allIds = new uint256[](projectCount);
        uint count = 0;
        for (uint i = 0; i < projectCount; i++) {
            if (projects[i].donations[_donor] > 0) {
                allIds[count] = i;
                count += 1;
            }
        }
        return (
            allIds
        );
    }

    function getMyDonationProject(uint256 _projectId, address _donor) external view returns (
        string memory name,
        address charityAddress,
        uint256 goalAmount,
        uint256 raisedAmount,
        bool isActive,
        uint256 milestoneCount,
        uint256 donorAmount
    ) {
        Project storage project = projects[_projectId];
        uint256 amount = project.donations[_donor];
        return (
            project.name,
            project.charityAddress,
            project.goalAmount,
            project.raisedAmount,
            project.isActive,
            project.milestones.length,
            amount
        );
    }

    function getMyCharityProjectIds(address _address) external view returns (
        uint256[] memory id
    ) {     
        uint256[] memory allIds = new uint256[](projectCount);
        uint count = 0;
        for (uint i = 0; i < projectCount; i++) {
            if (projects[i].charityAddress == _address) {
                allIds[count] = i;
                count += 1;
            }
        }
        return (
            allIds
        );
    }

    function getMilestone(uint256 _projectId, uint256 _milestoneIndex) external view returns (
        string memory description,
        uint256 targetAmount,
        bool isCompleted,
        bool fundsReleased
    ) {
        Project storage project = projects[_projectId];
        require(_milestoneIndex < project.milestones.length, "Invalid milestone index");
        
        uint256 milestoneProjectIndex = project.milestones[_milestoneIndex];
        Milestone storage milestone = milestones[milestoneProjectIndex];
        // Milestone storage milestone = project.milestones[_milestoneIndex];
        return (
            milestone.description,
            milestone.targetAmount,
            milestone.isCompleted,
            milestone.fundsReleased
        );
    }

    receive() external payable {}
}