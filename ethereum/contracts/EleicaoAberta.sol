pragma solidity ^0.4.25;


contract OpenElectionFactory {

    address[] public deployedOpenElections;

    function createOpenElection(uint numMaxCandidates, uint numMaxVoters, uint onlyAuthenticated) public {
        OpenElection newOpenElection = new OpenElection(numMaxCandidates, numMaxVoters, onlyAuthenticated);
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
    }

    struct Candidate {
        string completeName;
        address where;
        uint numVotes;
        bool authenticated;
    }

    address public manager;
    mapping(address => uint) public candidates;
    People[] public candidatesArray;
    mapping(address => uint) public voters;
    People[] public votersArray;
    uint public maxCandidates;
    uint public maxVoters;
    uint public numberVotesAuthenticated;
    bool public onlyAuthenticated;
    bool public isEnded;
    mapping(address => bool) public alreadyVoted;

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    modifier alreadyVoted() {
        require(!alreadyVoted[msg.sender]);
        _;
    }

    modifier isVoter() {
        require(voters[msg.sender]);
        _;
    }

    modifier authenticated() {
        require(onlyAuthenticated);
        _;
    }

    constructor(uint numMaxCandidates, uint numMaxVoters, onlyAuthenticated) public {
        manager = msg.sender;
        maxCandidates = numMaxCandidates;
        maxVoters = numMaxVoters;
        onlyAuthenticated = onlyAuthenticated;
        isEnded = false;
    }

    function createVoter(string memory completeName)
    public
    {
        Voter memory newVoter = new Voter ({
            completeName = completeName,
            authenticated = false
        });

        candidates[msg.sender] = votersArray.length + 1;
        votersArray.push(newVoter);
    }

    function createCandidate(string memory completeName)
    public restricted
    {
        Candidate memory newCandidate = new Candidate ({
            completeName = completeName,
            authenticated = false,
            numVotes = 0
        });

        candidates[msg.sender] = candidatesArray.length + 1;
        candidatesArray.push(newCandidate);
    }

    function vote(uint indexOfCandidate)
    public isVoter alreadyVoted
    {
        Candidate storage candidate = candidatesArray[indexOfCandidate];
        candidate.numVotes++;
    }

    function endOpenElection() public restricted {
        require(!isEnded);
        require(votersArray.length >= (numMaxVoters * 0.6));
        isEnded = true;
    }

}
