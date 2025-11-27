"use client";

import React,{useState, useEffect} from "react";
import { FaUser, FaPhone, FaCar, FaMapMarkerAlt, FaSpinner } from "react-icons/fa";
import { IoMdCard } from "react-icons/io";
import { RiCoupon3Line } from "react-icons/ri";
import { AiFillStar } from "react-icons/ai";
import { useRouter } from "next/navigation";
import { BsArrowLeft } from "react-icons/bs";
import { axiosInstance } from "@/utils/axiosInstance";


type Person = {
  name: string;
  mobile: string;
  appVersion?: string;
};

type Driver = Person & {
  vehicleType: string;
  vehicleNumber: string;
};

// export type Ride = {
//   id: string;
//   rideId: string;
//   rideDetails: string;
//   user: Person;
//   driver: Driver;
//   pickup: string;
//   dropoff: string;
//   startTime: string;
//   endTime?: string;
//   durationMinutes?: number;
//   distanceKm?: number;
//   estimatedFare: number;
//   finalFare?: number;
//   paymentMethod?: string;
//   paymentStatus?: "Pending" | "Success" | "Failed" | "Cancelled";
//   coupon?: string | null;
//   userRating?: number;
//   driverRating?: number;
//   userFeedback?: string | null;
//   driverFeedback?: string | null;
// };

// const sampleRide: Ride = {
//   id: "RIDE-20251125-001",
//   user: { name: "Ananya Roy", mobile: "+91 98765 43210", appVersion: "v3.4.1" },
//   driver: { name: "Ravi Kumar", mobile: "+91 91234 56789", vehicleType: "Sedan", vehicleNumber: "WB04AB1234" },
//   pickup: "Salt Lake Sector V, Kolkata",
//   dropoff: "Howrah Maidan, Howrah",
//   startTime: "2025-11-24T18:06:00.000Z",
//   endTime: "2025-11-24T18:46:00.000Z",
//   durationMinutes: 40,
//   distanceKm: 16.5,
//   estimatedFare: 350,
//   finalFare: 380,
//   paymentMethod: "Card",
//   paymentStatus: "Success",
//   coupon: "NEWUSER50",
//   userRating: 5,
//   driverRating: 4,
//   userFeedback: "Driver was polite, clean car.",
//   driverFeedback: "Passenger was on time and courteous.",
// };

export type Ride = any;

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white shadow-sm rounded-2xl p-4">
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  );
}

function Rating({ value }: { value?: number }) {
  const v = Math.round((value || 0) * 2) / 2;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <AiFillStar key={i} className={`text-lg ${i < Math.floor(v) ? "text-yellow-500" : "text-gray-300"}`} />
      ))}
      <span className="ml-2 text-sm text-gray-600">{v ? v.toFixed(1) : "—"}</span>
    </div>
  );
}

export default function RideDetailsPage({
  initialRide,
  rideId,
}: {
  initialRide?: Ride | null;
  rideId?: string;
}) {
  const router = useRouter();
  const [ride, setRide] = useState<Ride | null>(initialRide ?? null);
  const [loading, setLoading] = useState<boolean>(!initialRide);
  const [error, setError] = useState<string | null>(null);
  const status = ride?.rideDetails.status?.toLowerCase();

  useEffect(() => {
    if (!rideId) {
      setLoading(false);
      setError("Missing ride id");
      return;
    }
    if (initialRide) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchRide = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/api/admin/rides/${rideId}`);
        const data = response.data?.data ?? response.data;
        if (!cancelled) {
          setRide(data ?? null);
          setError(data ? null : "No ride data returned");
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.message || err.message || "Failed to load ride");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchRide();
    return () => {
      cancelled = true;
    };
  }, [rideId, initialRide]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading ride details...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!ride) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Ride not found.</p></div>;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-full mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <button
              onClick={() => router.back()}
              className="inline-flex gap-2 items-center px-3 py-1 rounded-md border bg-white shadow-sm text-sm hover:bg-gray-100 mb-4"
            >
              <BsArrowLeft />
              Back
            </button>

            <h1 className="text-2xl md:text-3xl font-bold">Ride Details</h1>
            <p className="text-sm text-gray-500">Ride ID: <span className="font-mono">{ride.rideId}</span></p>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-500 text-center">Status</p>
            <span
  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium 
    ${
      status === "success" || status === "completed"
        ? "bg-green-100 text-green-800"
        : status === "pending" || status === "ongoing"
        ? "bg-yellow-100 text-yellow-800"
        : status === "cancelled"
        ? "bg-red-100 text-red-800"
        : "bg-gray-200 text-gray-700"
    }
  `}
>
  {ride.rideDetails.status ?? "—"}
</span>

          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <InfoCard title="User Details">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><FaUser /></div>
                <div>
                  <div className="font-semibold">{ride.userDetails.name}</div>
                  <div className="text-sm text-gray-500 flex items-center gap-2"><FaPhone /> {ride.userDetails.phone}
                   </div>
                </div>
              </div>
            </InfoCard>

            <InfoCard title="Driver Details">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><FaCar /></div>
                <div>
                  <div className="font-semibold">{ride.driverDetails.name ?? "—"}</div>
                  <div className="text-sm text-gray-500">{ride.driverDetails.phone ?? "—"}</div>
                  <div className="mt-2 text-sm text-gray-600">{ride.driverDetails.vehicleType ?? "—"} • {ride.driverDetails.vehicleModel ?? "—"}</div>
                </div>
              </div>
            </InfoCard>

            <InfoCard title="Pickup & Drop">
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <span className="pt-1"><FaMapMarkerAlt /></span>
                  <div>
                    <div className="text-sm font-medium text-gray-700">Pickup</div>
                    <div className="text-sm text-gray-600">{ride.pickupAndDropLocation.pickup.address ?? "—"}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="pt-1"><FaMapMarkerAlt /></span>
                  <div>
                    <div className="text-sm font-medium text-gray-700">Dropoff</div>
                    <div className="text-sm text-gray-600">{ride.pickupAndDropLocation.drop.address ?? "—"}</div>
                  </div>
                </div>
              </div>
            </InfoCard>

            <InfoCard title="Timing & Distance">
              <div className="grid grid-cols-2 gap-4">
                <Stat label="Start Time" value={new Date(ride.rideDetails.pickupTime).toLocaleString() ?? "—"} />
                <Stat label="End Time" value={new Date(ride.rideDetails.completionTime).toLocaleString() ?? "—"} />
                <Stat label="Duration" value={ride.timeAndDistance.estimatedTime ? `${ride.timeAndDistance.estimatedTime}` : "—"} />
                <Stat label="Distance" value={ride.timeAndDistance.totalDistance ? `${ride.timeAndDistance.totalDistance}` : "—"} />
              </div>
            </InfoCard>

            <InfoCard title="Fare & Payment">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <div className="text-sm text-gray-500">Estimated Fare</div>
                  <div className="text-xl font-semibold">₹{ride.farePayment.estimatedFare ?? "—"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Final Fare</div>
                  <div className="text-xl font-semibold">₹{ride.finalFare ?? "—"}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-sm text-gray-500">Payment Method</div>
                  <div className="flex items-center gap-3 mt-2">
                    <IoMdCard /> <span className="font-medium">{ride.paymentMethod ?? "—"}</span>
                    <span className="ml-4 text-sm text-gray-500">Status: <span className="font-semibold">{ride.paymentStatus ?? "—"}</span></span>
                  </div>
                </div>
                <div className="sm:col-span-2 flex items-center gap-2 text-sm text-gray-600">
                  <RiCoupon3Line /> <span>{ride.coupon ?? "No coupon applied"}</span>
                </div>
              </div>
            </InfoCard>

            <InfoCard title="Ratings & Feedback">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div>
                  <div className="text-sm text-gray-500">User rating for driver</div>
                  <div className="mt-2 flex items-center justify-between">
                    <Rating value={ride.userDetails.ratingStats?.totalScore ?? "—"} />
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-500">Driver rating for user</div>
                  <div className="mt-2 flex items-center justify-between">
                    <Rating value={ride.driverDetails.ratingStats?.totalScore ?? "—"} />
                  </div>
                </div>
              </div>
            </InfoCard>
          </div>

          <aside className="space-y-4">
            <div className="sticky top-20">
              <div className="bg-white shadow-sm rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm text-gray-500">Summary</h4>
                    <div className="text-xl font-bold">₹{ride.finalFare ?? ride.summary.estimatedPrice}</div>
                    <div className="text-xs text-gray-500">{ride.summary.totalDistance ?? "—"} • {ride.summary.estimatedTime ?? "—"}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Estimated</span>
                    <span>₹{ride.summary.estimatedPrice}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-800 font-medium mt-1">
                    <span>Final</span>
                    <span>₹{ride.finalFare ?? "—"}</span>
                  </div>
                </div>

                <div className="pt-3">
                  <a href={`tel:${ride.driverDetails.phone}`} className="w-full block text-center py-2 rounded-xl border border-transparent bg-indigo-600 text-white font-medium">Call driver</a>
                </div>

                <div className="pt-2 text-xs text-gray-500">Payment: {ride.paymentMethod} • <span className="font-semibold">{ride.paymentStatus ?? "—"}</span></div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
