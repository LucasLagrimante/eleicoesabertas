import React, { Component } from 'react';
import { Table, Button } from 'semantic-ui-react';
import web3 from '../ethereum/web3';
import Campaign from '../ethereum/openelection';

class RequestRow extends Component {
  onApprove = async () => {
    const openElection = Campaign(this.props.address);
    const accounts = await web3.eth.getAccounts();

    await openElection.methods.approveRequest(this.props.id).send({
      from: accounts[0]
    });
    
    Router.pushRoute(`/openElections/${this.props.address}/requests`);
  }

  onFinalize = async () => {
    const openElection = Campaign(this.props.address);
    const accounts = await web3.eth.getAccounts();

    await openElection.methods.finalizeRequest(this.props.id).send({
      from: accounts[0]
    });

    Router.pushRoute(`/openElections/${this.props.address}/admin/requests`);
  }

  render() {
    const { Row, Cell } = Table;
    const { id, request, value, recipient, approvalCount, approversCount } = this.props;
    const readToFinalize = request.approvalCount > approversCount / 2;

    return (
      <Row disabled={request.complete} positive={readToFinalize && !request.complete}>
        <Cell>{id+1}</Cell>
        <Cell>{request.description}</Cell>
        <Cell>{web3.utils.fromWei(request.value, 'ether')}</Cell>
        <Cell>{request.recipient}</Cell>
        <Cell>{request.approvalCount}/{approversCount}</Cell>
        {
        request.complete ? null :
        (<Cell><Button color="green" basic onClick={this.onApprove}>Approve</Button></Cell>)
        }
        {
        request.complete ? null :
        <Cell><Button color="teal" basic onClick={this.onFinalize}>Finalize</Button></Cell>
        }
      </Row>
    );
  }
}

export default RequestRow;
