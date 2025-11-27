import RideDetailsPage from "@/components/Ride-Details/RideDetails";

export default function RidePage({ params }: { params: { id: string } }) {
  return <RideDetailsPage rideId={params.id} />;
}