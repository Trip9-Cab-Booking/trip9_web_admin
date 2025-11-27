import RideDetailsPage from "@/components/Ride-Details/RideDetails";

export default function RidePage({ params }: any) {
  return <RideDetailsPage rideId={params.id} />;
}