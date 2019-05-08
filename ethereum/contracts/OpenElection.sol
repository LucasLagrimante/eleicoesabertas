pragma solidity >=0.4.25;

/// @author Lucas Lagrimante Martinho
// Votos terão peso?
// Segundo turno?

contract OpenElectionFactory {

    address[] public deployedOpenElections;

    function createOpenElection(
    uint _maxCandidates, uint _maxVoters, bool _onlyAuthenticated, string memory _electionName)
    public
    {
        OpenElection newOpenElection = new OpenElection(
            msg.sender, _maxCandidates, _maxVoters, _onlyAuthenticated, _electionName
        );
        deployedOpenElections.push(address(newOpenElection));
    }

    function getDeployedOpenElections() public view returns (address[] memory) {
        return deployedOpenElections;
    }

    function getDeployedOpenElectionsCount() public view returns (uint256) {
        return deployedOpenElections.length;
    }
}


contract OpenElection {

    struct Voter {
        string completeName;
        address where;
        string cpf;
        bool authenticated;
        bool voted;
        bool exists;
    }

    struct Candidate {
        string completeName;
        address where;
        string cpf;
        bool authenticated;
        // essa variavel nao pode ser vista por ninguém
        uint numVotes;
        bool exists;
    }

    address public manager;
    string public electionName;
    mapping(address => uint) internal candidates;
    Candidate[] internal candidatesArray;
    mapping(address => uint) internal voters;
    Voter[] internal votersArray;
    uint public maxCandidates;
    uint public maxVoters;
    uint public totalVotes;
    bool public onlyAuthenticated;
    bool public isEnded;
    bool public isStarted;
    address public winner;

    modifier restricted() {
        require(msg.sender == manager, "Você não tem permissão para executar essa ação.");
        _;
    }

    modifier isVoter() {
        require(voters[msg.sender] != 0, "Você não é um Eleitor.");
        _;
    }

    modifier isManager() {
        require(msg.sender != manager, "Você é o administrador da Eleição.");
        _;
    }

    modifier authenticated() {
        require(onlyAuthenticated, "Usuário não está autenticado.");
        _;
    }

    modifier ended() {
        require(!isEnded, "Essa eleição já terminou.");
        _;
    }

    modifier started() {
        require(!isStarted, "Essa eleição já está em andamento.");
        _;
    }

    constructor
    (address creator, uint _maxCandidates, uint _maxVoters, bool _onlyAuthenticated, string memory _electionName)
    public {
        manager = creator;
        maxCandidates = _maxCandidates;
        maxVoters = _maxVoters;
        onlyAuthenticated = _onlyAuthenticated;
        electionName = _electionName;
    }

    function beAnVoter(string memory _completeName, string memory _cpf)
    public ended isManager started
    {
        require(votersArray.length < maxVoters, "Limite de eleitores atingido.");
        require(voters[msg.sender] == 0, "Você já é um Eleitor.");
        require(candidates[msg.sender] == 0, "Você é um Candidato e não pode ser um eleitor.");

        Voter memory newVoter = Voter({
            completeName: _completeName,
            where: msg.sender,
            cpf: _cpf,
            authenticated: false,
            voted: false,
            exists: true
        });

        votersArray.push(newVoter);
        voters[msg.sender] = votersArray.length;
    }

    function createCandidate(string memory _completeName, string memory _cpf, address _candidateAddress)
    public restricted ended started
    {
        require(candidatesArray.length < maxCandidates, "Limite de candidatos atingido.");
        require(voters[_candidateAddress] == 0, "Usuário é um Eleitor.");
        require(candidates[_candidateAddress] == 0, "Usuário já é um Candidato.");
        require(_candidateAddress != manager, "Esse Candidato é o administrador.");

        Candidate memory newCandidate = Candidate({
            completeName: _completeName,
            where: _candidateAddress,
            cpf: _cpf,
            authenticated: false,
            numVotes: 0,
            exists: true
        });

        candidatesArray.push(newCandidate);
        candidates[_candidateAddress] = candidatesArray.length;
    }

    function vote(address _addressOfCandidate)
    public isVoter ended
    {
        require(isStarted, "Eleição ainda não começou.");
        Voter storage voter = votersArray[voters[msg.sender] - 1];
        require(voter.exists, "Você não é um Eleitor (não existe ainda).");
        require(!voter.voted, "Você não pode votar duas vezes!.");
        if (onlyAuthenticated) {
            require(voter.authenticated, "Apenas usuários autenticados.");
        }

        require(candidatesArray[candidates[_addressOfCandidate]].exists, "Candidato não existe.");
        Candidate storage candidate = candidatesArray[candidates[_addressOfCandidate]];
        if (onlyAuthenticated) {
            require(candidate.authenticated, "Apenas candidatos autenticados podem ser votados autenticados.");
        }

        candidate.numVotes++;
        totalVotes++;
        voter.voted = true;
        if (totalVotes == votersArray.length) {
            endOpenElection();
        }
    }

    function startOpenElection()
    public restricted ended started
    {
        isStarted = true;
    }

    function setVoterAuthenticatedById(uint _indexOfVoter)
    public restricted started
    {
        require(votersArray[_indexOfVoter].exists, "Eleitor não existe.");

        Voter storage voter = votersArray[_indexOfVoter];
        require(voter.authenticated != true, "Eleitor já autenticado.");

        voter.authenticated = true;
    }

    function setCandidateAuthenticatedById(uint _indexOfCandidate)
    public restricted started
    {
        require(candidatesArray[_indexOfCandidate].exists, "Candidato não existe.");

        Candidate storage candidate = candidatesArray[_indexOfCandidate];
        require(candidate.authenticated != true, "Candidato já autenticado.");

        candidate.authenticated = true;
    }

    function getNumOfVoters()
    public view returns (uint256)
    {
        return votersArray.length;
    }

    function getNumOfCandidates()
    public view returns (uint256)
    {
        return candidatesArray.length;
    }

    function getIndexCandidateByAddress(address _addressOfCandidate)
    public view returns (uint256)
    {
        return candidates[_addressOfCandidate];
    }

    function getAddressCandidateByIndex(uint _indexOfCandidate)
    public view returns (address)
    {
        require(candidatesArray[_indexOfCandidate].exists, "Candidato não existe.");
        return candidatesArray[_indexOfCandidate].where;
    }

    function isCandidateBool(address _addressOfCandidate)
    public view returns (bool)
    {
        return candidatesArray[candidates[_addressOfCandidate]].exists;
    }

    function isVoterBool(address _addressOfVoter)
    public view returns (bool)
    {
        return votersArray[voters[_addressOfVoter]].exists;
    }

    function getSummary() public view returns (
        address, address, uint256, uint256, uint256, bool, bool, bool, string memory
        ) {
        return (
            manager,
            winner,
            maxVoters,
            maxCandidates,
            totalVotes,
            onlyAuthenticated,
            isEnded,
            isStarted,
            electionName
        );
    }

    function forceEndOpenElection()
    public restricted ended
    {
        require(isStarted, "Essa eleição ainda não começou.");
        require(totalVotes > (maxVoters / 2), "Número mínimo de votos ainda não atingido para finalizar eleição.");
        isEnded = true;
        setWinner();
    }

    function endOpenElection()
    internal ended
    {
        require(isStarted, "Essa eleição ainda não começou.");
        require(totalVotes > (maxVoters / 2), "Número mínimo de votos ainda não atingido para finalizar eleição.");
        isEnded = true;
        setWinner();
    }

    function setWinner()
    internal
    {
        require(isEnded, "Eleição em andamento.");

        for (uint i = 0; i < candidatesArray.length; i++) {
            Candidate storage candidate = candidatesArray[i];
            winner = candidate.where;

            if (i > 0) {
                Candidate storage previousCandidate = candidatesArray[i-1];
                if (candidate.numVotes > previousCandidate.numVotes) {
                    winner = previousCandidate.where;
                }
            }
        }
    }

    function getAddressVoterByIndex(uint _indexOfVoter)
    private view returns (address)
    {
        require(votersArray[_indexOfVoter].exists, "Eleitor não existe.");
        return votersArray[_indexOfVoter].where;
    }

}
