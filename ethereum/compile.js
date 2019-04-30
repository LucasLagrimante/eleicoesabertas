const path = require("path");
const solc = require("solc");
const fs = require("fs-extra");

try {
  const buildPath = path.resolve(__dirname, "build");
  fs.removeSync(buildPath);
  console.log('Pasta e arquivos apagados...');

  const openElectionPath = path.resolve(__dirname, "contracts", "OpenElection.sol");
  const source = fs.readFileSync(openElectionPath, "utf8");
  console.log('Contrato encontrado e carregado...');
  // to debug
  // console.log(solc.compile(source, 1));
  const output = solc.compile(source, 1).contracts;
  console.log('Compilado com sucesso...');

  fs.ensureDirSync(buildPath);

  for (let contract in output) {
    fs.outputJsonSync(
      path.resolve(buildPath, contract.replace(':', '') + ".json"),
      output[contract]
    );
  }
  console.log('Arquivos Criados!');
} catch (e) {
  console.log(e);
}
