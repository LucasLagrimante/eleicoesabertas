pragma solidity ^0.4.25;


contract OpenElectionFactory {

    address[] public deployedOpenElections;

    function createOpenElection(bool candidatesOpen, uint numMaxCandidates, uint numMaxVoters) public {
        OpenElection newOpenElection = new OpenElection(candidatesOpen, numMaxCandidates, numMaxVoters);
        deployedOpenElections.push(address(newOpenElection));
    }

    function getDeployedOpenElections() public view returns (address[] memory) {
        return deployedOpenElections;
    }
}


contract OpenElection {

    struct Candidate {
        string name;
        address where;
        bool authenticated;
    }

    struct Voter {
        string name;
        address where;
        bool alreadyVoted;
        bool authenticated;
    }

    Candidates[] public candidates;
    uint public maxCandidates;
    uint public maxVoters;
    bool public isCandidatesOpen;
    mapping(address => bool) public voters;

    //funcoes modificadoras sao colocadas normalmente acima da constructora
    //declaradas depois da visibilidade da funcion
    modifier voter() {
        require(voters[msg.sender]);
        _;
    }

    constructor(bool candidatesOpen, uint numMaxCandidates, uint numMaxVoters) public {
        isCandidatesOpen = candidatesOpen;
        maxCandidates = numMaxCandidates;
        maxVoters = numMaxVoters;
    }

    function vote() public voter {
      //verificar se já votou
    }

}
