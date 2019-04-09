pragma solidity >=0.4.25;


contract OpenElectionFactory {

    address[] public deployedOpenElections;

    function createOpenElection(uint numMaxCandidates, uint numMaxVoters, bool secureElection) public {
        OpenElection newOpenElection = new OpenElection(numMaxCandidates, numMaxVoters, secureElection);
        deployedOpenElections.push(address(newOpenElection));
    }

    function getDeployedOpenElections() public view returns (address[] memory) {
        return deployedOpenElections;
    }
}


contract OpenElection {

    struct Voter {
        string completeName;
        address where;
        bool authenticated;
        bool voted;
    }

    struct Candidate {
        string completeName;
        address where;
        bool authenticated;
        uint numVotes;
    }

    address public manager;
    mapping(address => uint) public candidates;
    Candidate[] public candidatesArray;
    mapping(address => uint) public voters;
    Voter[] public votersArray;
    uint public maxCandidates;
    uint public maxVoters;
    uint public totalVotes;
    uint public numberVotesAuthenticated;
    bool public onlyAuthenticated;
    bool public isEnded;

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    modifier isVoter() {
        require(voters[msg.sender] != 0);
        _;
    }

    modifier authenticated() {
        require(onlyAuthenticated);
        _;
    }

    constructor(uint numMaxCandidates, uint numMaxVoters, bool secureElection) public {
        manager = msg.sender;
        maxCandidates = numMaxCandidates;
        maxVoters = numMaxVoters;
        onlyAuthenticated = secureElection;
        isEnded = false;
    }

    function createVoter(string memory completeName)
    public restricted
    {
        require(voters[msg.sender] == 0);
        require(candidates[msg.sender] == 0);
        require(votersArray.length < maxVoters);
        require(!isEnded);

        Voter memory newVoter = Voter({
            completeName: completeName,
            where: msg.sender,
            authenticated: false,
            voted: false
        });

        votersArray.push(newVoter);
        candidates[msg.sender] = votersArray.length;
    }

    function createCandidate(string memory completeName)
    public restricted
    {
        require(candidates[msg.sender] == 0);
        require(voters[msg.sender] == 0);
        require(candidatesArray.length < maxCandidates);
        require(!isEnded);

        Candidate memory newCandidate = Candidate({
            completeName: completeName,
            where: msg.sender,
            authenticated: false,
            numVotes: 0
        });

        candidatesArray.push(newCandidate);
        candidates[msg.sender] = candidatesArray.length;
    }

    function vote(uint indexOfCandidate)
    public isVoter
    {
        require(!isEnded);

        Voter storage voter = votersArray[voters[msg.sender]];

        require(!voter.voted);
        if (onlyAuthenticated) {
            require(voter.authenticated);
        }

        Candidate storage candidate = candidatesArray[indexOfCandidate];
        if (onlyAuthenticated) {
            require(candidate.authenticated);
        }
        candidate.numVotes++;
        totalVotes++;
    }

    function endOpenElection() public restricted {
        require(!isEnded);
        require(totalVotes >= (maxVoters / 2) + 1);
        isEnded = true;
    }

    function getNumOfCandidates() public view returns (uint) {
        return candidatesArray.length;
    }

    function getAddressCandidateById(uint candidate) public view returns (address) {
        return candidatesArray[candidate].where;
    }

    function getNumOfVoters() public view returns (uint) {
        return votersArray.length;
    }

    function getAddressVoterById(uint voter) public view returns (address) {
        return votersArray[voter].where;
    }
}
