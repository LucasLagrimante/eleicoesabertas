const path = require("path");
const solc = require("solc");
const fs = require("fs-extra");

// node compile.js

const buildPath = path.resolve(__dirname, "build");
fs.removeSync(buildPath);

const openElectionPath = path.resolve(__dirname, "contracts", "OpenElection.sol");
const source = fs.readFileSync(openElectionPath, "utf8");
// to debug
// console.log(solc.compile(source, 1));
const output = solc.compile(source, 1).contracts;

fs.ensureDirSync(buildPath);

for (let contract in output) {
  fs.outputJsonSync(
    path.resolve(buildPath, contract.replace(':', '') + ".json"),
    output[contract]
  );
}
console.log("Compilado com sucesso!");
