import React from "react";
import RideDetailsPage from "@/components/Ride-Details/RideDetails";

type Props = {
  params: { id: string };
};

export default async function RidePage({ params }: Props) {
  const { id } = params;
  let rideData = null;

  return <RideDetailsPage initialRide={rideData}/>;
}
