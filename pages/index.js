import React, { Component } from 'react';
import factory from '../ethereum/factory';
import Layout from '../components/Layout';
import { Link, Router } from '../routes';
import OpenElection from "../ethereum/openelection";
import { Button, Card, Header, Icon, Image, Modal } from 'semantic-ui-react'

class OpenElectionIndex extends Component {

  static async getInitialProps() {
    const openElectionsAddressArray = await factory.methods.getDeployedOpenElections().call();
    const openElectionsCount = await factory.methods.getDeployedOpenElectionsCount().call();

    const openElections = await Promise.all(
      Array(parseInt(openElectionsCount)).fill().map((element, index) => {
        return {
          openElectionNames: OpenElection(openElectionsAddressArray[index]).methods.electionName().call(function (err, result) {
            return result;
          }),
          openElectionName: 'Eleição ' + index,
          address: openElectionsAddressArray[index]
        }
      })
    );

    openElections.reverse();

    return { openElections, openElectionsCount }
  }

  componentDidMount() {
    ethereum.enable();
  }

  renderOpenElections() {
    const items = this.props.openElections.map((element, index) => {

      return {
        header: element.openElectionName.toString(),
        meta: element.address,
        description: (
          <Link route={`/openElections/${element.address}`}>
            <a>Ver Eleição Aberta</a>
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
            <a>
              <Button primary animated='fade' floated="right">
                <Button.Content visible>Criar Eleição Aberta</Button.Content>
                <Button.Content hidden>Agora mesmo!!</Button.Content>
              </Button>
            </a>
          </Link>

          {this.renderOpenElections()}

          <br />
          <div>Foram encontradas {this.props.openElections.length} eleições.</div>

        </div>

      </Layout>
    )
  }
}

export default OpenElectionIndex;
