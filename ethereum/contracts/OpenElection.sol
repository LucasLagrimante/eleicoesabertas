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
        bool voted;
        bool exists;
    }

    struct Candidate {
        string completeName;
        address where;
        string cpf;
        // essa variavel nao pode ser vista por ninguém
        uint numVotes;
        bool exists;
    }

    struct Request {
        address where;
        bool complete;
    }

    address public manager;
    string public electionName;
    mapping(address => uint) public candidates;
    Candidate[] public candidatesArray;
    mapping(address => uint) public voters;
    Voter[] public votersArray;
    uint public maxCandidates;
    uint public maxVoters;
    uint public totalVotes;
    bool public onlyAuthenticated;
    mapping(address => bool) public authenticated;
    mapping(address => bool) public requestIsOpen;
    Request[] public requests;
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

    modifier ended() {
        require(!isEnded, "Essa eleição já terminou.");
        _;
    }

    modifier started() {
        require(!isStarted, "Essa eleição já está em andamento.");
        _;
    }

    constructor
    ( address creator, uint _maxCandidates, uint _maxVoters, bool _onlyAuthenticated, string memory _electionName)
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
            voted: false,
            exists: true
        });

        votersArray.push(newVoter);
        voters[msg.sender] = votersArray.length;

        if (votersArray.length == maxVoters && candidatesArray.length == maxCandidates) {
            startOpenElectionInternal();
        }
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
            numVotes: 0,
            exists: true
        });

        candidatesArray.push(newCandidate);
        candidates[_candidateAddress] = candidatesArray.length;

        if (votersArray.length == maxVoters && candidatesArray.length == maxCandidates) {
            startOpenElectionInternal();
        }
    }

    function vote(address _addressOfCandidate)
    public isVoter ended
    {
        require(isStarted, "Eleição ainda não começou.");
        Voter storage voter = votersArray[voters[msg.sender] - 1];
        require(voter.exists, "Você não é um Eleitor (não existe ainda).");
        require(!voter.voted, "Você não pode votar duas vezes!.");
        if (onlyAuthenticated) {
            require(authenticated[voter.where], "Apenas usuários autenticados.");
        }

        require(candidatesArray[candidates[_addressOfCandidate] - 1].exists, "Candidato não existe.");
        Candidate storage candidate = candidatesArray[candidates[_addressOfCandidate] - 1];
        if (onlyAuthenticated) {
            require(authenticated[candidate.where], "Apenas candidatos autenticados podem ser votados.");
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
        require(votersArray.length > 0, "Ao menos um eleitor cadastrado.");
        require(candidatesArray.length > 0, "Ao menos um candidado cadastrado.");

        isStarted = true;
    }

    function startOpenElectionInternal()
    internal ended started
    {
        require(votersArray.length > 0, "Ao menos um eleitor cadastrado.");
        require(candidatesArray.length > 0, "Ao menos um candidado cadastrado.");

        isStarted = true;
    }

    function createRequest()
    public ended
    {

        require(candidates[msg.sender] > 0 || voters[msg.sender] > 0, "Eleitor ou Candidato não existe.");
        require(!authenticated[msg.sender], "Já autenticado.");
        require(!requestIsOpen[msg.sender], "Solicitação em andamento.");
        require(msg.sender != manager, "Esse Candidato é o administrador.");

        Request memory newRequest = Request({
            where: msg.sender,
            complete: false
        });

        requests.push(newRequest);
        requestIsOpen[msg.sender] = true;
    }

    function finalizeRequest(uint _id, address _address, bool _ok)
    public restricted ended
    {
        require(candidates[_address] > 0 || voters[_address] > 0, "Eleitor ou Candidato não existe.");
        require(!authenticated[_address], "Já autenticado.");
        require(_address != manager, "Esse Candidato é o administrador.");

        requests[_id].complete = true;
        authenticated[_address] = _ok;
        requestIsOpen[_address] = false;
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

    function getRequestsCount()
    public view returns (uint)
    {
        return requests.length;
    }

    function isCandidateBool(address _addressOfCandidate)
    public view returns (bool)
    {
        return candidatesArray[candidates[_addressOfCandidate] - 1].exists;
    }

    function isVoterBool(address _addressOfVoter)
    public view returns (bool)
    {
        return votersArray[voters[_addressOfVoter] - 1].exists;
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

    function getCandidateInfo(uint _indexOfCandidate) public view returns (
        string memory, address
        ) {

        Candidate storage candidate = candidatesArray[_indexOfCandidate];
        return (
            candidate.completeName,
            candidate.where
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
                if (candidate.numVotes >= previousCandidate.numVotes) {
                    if (candidate.numVotes != previousCandidate.numVotes){
                      winner = candidate.where;
                    }
                }
            }
        }
    }

}
