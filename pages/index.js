import React, { Component } from 'react';
import factory from '../ethereum/factory';
import { Card, Button } from 'semantic-ui-react';
import Layout from '../components/Layout';
import web3 from '../ethereum/web3';
import { Link } from '../routes';
import Campaign from '../ethereum/campaign';

class CampaignIndex extends Component {

  static async getInitialProps() {
    const campaignsAddressArray = await factory.methods.getDeployedCampaingns().call();
    const campaignsCount = await factory.methods.getDeployedCampaignsCount().call();

    const campaigns = await Promise.all(
      Array(parseInt(campaignsCount)).fill().map((element, index) => {
        return {
          campaignName: Campaign(campaignsAddressArray[index]).methods.campaignName().call(),
          address: campaignsAddressArray[index]
        }
      })
    );

    return { campaigns, campaignsCount }
  }

  renderCampaingns() {
    const items = this.props.campaigns.map((element, index) => {
      return {
        header: element.campaignName,
        meta: element.address,
        description: (
          <Link route={`/campaigns/${element.address}`}>
            <a>View Campaign</a>
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
        <h3> Open Campaigns </h3>
        <Link route='/campaigns/new'>
          <a>
            <Button
              floated="right"
              content="Creat Campaign"
              icon="add circle"
              primary
            />
          </a>
        </Link>
        {this.renderCampaingns()}
        </div>
      </Layout>
    )
  }
}

export default CampaignIndex;
