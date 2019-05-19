import React, { Component } from 'react';
import { Table, Button } from 'semantic-ui-react';
import web3 from '../ethereum/web3';
import OpenElection from '../ethereum/openelection';

class RequestRow extends Component {

  onApprove = async () => {
    const openElection = OpenElection(this.props.address);
    const [account] = await web3.eth.getAccounts();
    console.log(account);
    
    await openElection.methods.setAuthenticated(this.props.id, this.props.request.where, true).send({
      from: account
    });

    Router.pushRoute(`/openElections/${this.props.address}/admin/requests`);
  }

  onFinalize = async () => {
    const openElection = OpenElection(this.props.address);
    const [account] = await web3.eth.getAccounts();

    await openElection.methods.setAuthenticated(this.props.id, this.props.request.where, false).send({
      from: account
    });

    Router.pushRoute(`/openElections/${this.props.address}/admin/requests`);
  }

  render() {
    const { Row, Cell } = Table;
    const { id, request } = this.props;

    return (
      <Row disabled={request.complete} positive={!request.complete}>

        <Cell>{id + 1}</Cell>
        <Cell>{request.where}</Cell>

        {
          request.complete ? null :
            (
              <Cell>
                <Button color="green" basic onClick={this.onApprove}>Aprovar</Button>
              </Cell>
            )
        }

        {
          request.complete ? null :
            (

              <Cell>
                <Button color="teal" basic onClick={this.onFinalize}>Recusar</Button>
              </Cell>
            )

        }

      </Row>
    );
  }
}

export default RequestRow;
