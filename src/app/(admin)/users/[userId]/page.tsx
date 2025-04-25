"use client"


import { selectAccessToken } from '@/store/authSlice';
import axios from 'axios';
import React, { use, useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { UserCircle, Phone, Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { User } from '@/types/users';

const UserPage = ({params}: {params: Promise<{userId: string}>}) => {

    const { userId } = use(params); // <-- this is the key fix
    const token = useSelector(selectAccessToken);
    const [userData, setUserData] = useState<User>({} as User);

    // Format date function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

    // Calculate age from DOB
    // const calculateAge = (dob: string) => {
    //     const today = new Date();
    //     const birthDate = new Date(dob);
    //     let age = today.getFullYear() - birthDate.getFullYear();
    //     const monthDiff = today.getMonth() - birthDate.getMonth();
    //     if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    //       age--;
    //     }
    //     return age;
    //   };



    useEffect(() => {
        const fetchDriverData = async() => {
            if(!userId){
                throw new Error("User Id is invalid");
            }
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/users/?userId=${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'ngrok-skip-browser-warning': '69420',
                      },
                })
                const data = res.data.data[0];
                console.log(data);

                setUserData(data);
            } catch (error) {
                console.log(error);
            }
        }
        fetchDriverData();
    }, [])


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-600 py-4 px-4 sm:px-6 lg:px-8">
        <Link href={"/users"} className='flex gap-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-500 w-fit p-1 rounded-md px-4 mb-8' >
            <ArrowLeft />
            Back
        </Link>
        {
            userData ? (
                <div className="max-w-5xl mx-auto">

                  {/* Header Section */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6 transition-colors duration-300">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            {
                                userData.profilePic ? (
                                    <Image src={userData?.profilePic} width={32} height={32}  alt='profile'
                                    objectFit='center' className='w-24 h-24 rounded-full'
                                    />
                                ) : (
                                    <UserCircle className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                                )
                            }
                        </div>
                        <div>
                          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {userData.firstName} {userData.lastName}
                          </h1>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded-full font-medium capitalize">
                              {userData.role}
                            </span>
                            <span className={`px-3 py-1 ${
                              userData.status === 'active' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                              : 'bg-red-500 dark:bg-red-400 text-slate-200 dark:text-yellow-400'
                            } text-sm rounded-full font-medium capitalize`}>
                              {userData.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {userData.isProfileComplete && (
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <CheckCircle className="w-5 h-5" />
                            <span className="text-sm font-medium">Profile Complete</span>
                          </div>
                        )}
                        {/* {userData.isProfileVerified && (
                          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <Award className="w-5 h-5" />
                            <span className="text-sm font-medium">Verified</span>
                          </div>
                        )} */}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Personal Information */}
                    <div className="lg:col-span-2">
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6 transition-colors duration-300">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Personal Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            {/* <div className="flex items-center gap-3">
                              <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</p>
                                <p className="font-medium text-gray-900 dark:text-white">{formatDate(userData.dob)}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Age: {calculateAge(userData.dob)} years</p>
                              </div>
                            </div> */}
                            <div className="flex items-center gap-3">
                              <UserCircle className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Gender</p>
                                <p className="font-medium text-gray-900 dark:text-white capitalize">{userData.gender}</p>
                              </div>
                            </div>
                            {/* <div className="flex items-center gap-3">
                              <Briefcase className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Experience</p>
                                <p className="font-medium text-gray-900 dark:text-white">{userData.experienceInYears} years</p>
                              </div>
                            </div> */}

                            <div className="flex items-center gap-3">
                              <Phone className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                                <p className="font-medium text-gray-900 dark:text-white">{userData.phone}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Mail className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                <p className="font-medium text-gray-900 dark:text-white">{userData.email}</p>
                              </div>
                            </div>
                            {/* <div className="flex items-start gap-3">
                              <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500 mt-1" />
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                                <p className="font-medium text-gray-900 dark:text-white">{userData.address}</p>
                              </div>
                            </div> */}
                          </div>
                        </div>
                      </div>

                      {/* Bank Details */}
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Bank Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Account Holder Name</p>
                              <p className="font-medium text-gray-900 dark:text-white">{userData.bankDetails?.name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">PAN Number</p>
                              <p className="font-medium text-gray-900 dark:text-white">{userData.bankDetails?.pan}</p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Bank Phone</p>
                              <p className="font-medium text-gray-900 dark:text-white">{userData.bankDetails?.phone}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Bank DOB Record</p>
                              <p className="font-medium text-gray-900 dark:text-white">{userData.bankDetails?.dob ? formatDate(userData.bankDetails.dob) : 'N/A'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Documents & System Information */}
                    <div className="space-y-6">
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">System Information</h2>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">User ID</p>
                            <p className="font-medium text-gray-900 dark:text-white font-mono text-sm break-all">{userData._id}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Account Created</p>
                            <p className="font-medium text-gray-900 dark:text-white">{formatDate(userData.createdAt)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                            <p className="font-medium text-gray-900 dark:text-white">{formatDate(userData.updatedAt)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

            ) : (
                <div>No Data found</div>
            )
        }
  </div>
  )
}

export default UserPage;
