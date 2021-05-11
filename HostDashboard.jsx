/** @format */

import React from "react";
import { Grid } from "@material-ui/core";

import { PageTitle } from "../../layout-components";

import { hostDashboardProps } from "./hostProps";
import { getCurrentVehicles as getVehicles } from "../../services/vehicleService";
import { getCreatedBy as getProperties } from "../../services/hostProfileService";
import { getByCreatedBy as getEvents } from "../../services/eventService";
import { getCreatedBy as getListings } from "../../services/listingService";
import { getByHostId as getReservations } from "../../services/listingReservationService";
import { getCreatedBy as getParking } from "../../services/parkingService";

import HostManageSection from "./HostManageSection";
import HostAnalyticsSection from "./HostAnalyticsSection";
import HostUpcomingResCard from "./HostUpcomingResCard";
import HostListingsCreatedCard from "./HostListingsCreatedCard";
// *** Ignore - work in progress ***
// import HostFinancialYearSection from "./HostFinancialYearSection";
// import HostVisitorLocationsSection from "./HostVisitorLocationsSection";
import HostSocialMediaSection from "./HostSocialMediaSection";

import HostFanInfoCard from "./HostFanInfoCard";
import HostCardSection from "./HostCardSection";
import HostFooter from "./HostFooter";

class HostDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      reservations: [],
      vehicles: [],
      properties: [],
      events: [],
      listings: [],
      parking: [],
    };
  }

  componentDidMount() {
    getVehicles().then(this.onGetVehiclesSuccess);
    getProperties().then(this.onGetPropertiesSuccess);
    getEvents().then(this.onGetEventsSuccess);
    getListings().then(this.onGetListingsSuccess);
    getReservations().then(this.onGetReservationsSuccess);
    getParking().then(this.onGetParkingSuccess);
  }

  onGetListingsSuccess = (response) => {
    this.setState(() => {
      return { listings: response.items };
    });
  };

  onGetReservationsSuccess = (response) => {
    this.setState(() => {
      return { reservations: response.items };
    });
  };

  onGetEventsSuccess = (response) => {
    this.setState(() => {
      return { events: response.items };
    });
  };

  onGetPropertiesSuccess = (response) => {
    this.setState(() => {
      return { properties: [...response.items] };
    });
  };

  onGetVehiclesSuccess = (response) => {
    this.setState(() => {
      return { vehicles: [...response.items] };
    });
  };

  onGetParkingSuccess = (response) => {
    this.setState(() => {
      return {
        parking: response.items.filter((profile) => profile.status.id !== 3),
      }; //Filter out "deleted"
    });
  };

  render() {
    return (
      <React.Fragment>
        <PageTitle
          titleHeading={`Welcome ${this.props.currentUser.firstName} ${this.props.currentUser.lastName}`}
          titleDescription=""
        />
        <HostAnalyticsSection
          currentUser={this.props.currentUser}
          reservations={this.state.reservations}
        />
        <Grid container spacing={4}>
          <HostUpcomingResCard
            reservations={this.state.reservations}
            listings={this.state.listings}
          />
          <HostListingsCreatedCard
            listings={this.state.listings}
            properties={this.state.properties}
          />
        </Grid>
        <HostCardSection hostItems={this.state} />
        <HostManageSection hostItems={this.state} />
        <HostFanInfoCard />
        {/*  *** Ignore: Work in Progress ***  */}
        {/* <HostSection5 /> */}
        {/* <HostSection7 /> */}
        {/* <Grid container spacing={4}>
          <HostFinancialYearSection />
          <HostVisitorLocationsSection />
        </Grid> */}
        {/*  *** Ignore: Work in Progress ***  */}
        <HostSocialMediaSection />

        <HostFooter />
      </React.Fragment>
    );
  }
}

HostDashboard.propTypes = hostDashboardProps;

export default HostDashboard;
