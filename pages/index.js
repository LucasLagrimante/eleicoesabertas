import React, { Component } from 'react';
import factory from '../ethereum/factory';
import { Card, Button } from 'semantic-ui-react';
import Layout from '../components/Layout';
import web3 from '../ethereum/web3';
import { Link } from '../routes';
import OpenElection from '../ethereum/openelection';

class OpenElectionIndex extends Component {

  static async getInitialProps() {
    const openElectionsAddressArray = await factory.methods.getDeployedOpenElections().call();
    const openElectionsCount = await factory.methods.getDeployedOpenElectionsCount().call();
    const openElectionsArray = [];

    const openElections = await Promise.all(
      Array(parseInt(openElectionsCount)).fill().map((element, index) => {
        return {
        //  openElectionName: OpenElection(openElectionsAddressArray[index]).methods.electionName().call().then(v => {
        //    console.log(v);
        //  }),
        openElectionName: 'Eleição ' + index,
          address: openElectionsAddressArray[index]
        }
      })
    );

    openElections.reverse();

    return { openElections, openElectionsCount }
  }

  renderOpenElections() {
    const items = this.props.openElections.map((element, index) => {
      return {
        header: element.openElectionName.toString(),
        meta: element.address,
        description: (
          <Link route={`/openElections/${element.address}`}>
            Ver Eleição Aberta
          </Link>
        ),
        fluid: true
      }

    });

    return <Card.Group items={items} />;
  }

  render() {
    return (
      <Layout>
        <div>
        <h3> Eleições Criadas </h3>
        <Link route='/openElections/new'>
            <Button
              floated="right"
              content="Criar Eleição Aberta"
              icon="add circle"
              primary
            />
        </Link>
        {this.renderOpenElections()}
        </div>
      </Layout>
    )
  }
}

export default OpenElectionIndex;
