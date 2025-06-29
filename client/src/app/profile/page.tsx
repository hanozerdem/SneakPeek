"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Heart, ShoppingBag, Calendar,Truck, Mail, User, Edit2, Save, X, Check } from "lucide-react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface User {
  id: string;
  username: string;
  email: string;
  address?: string;
  wishlist?: number[];
  cart?: number[];
}
// adress yok bizde amınakee eklenmesi lazım 
interface UpdateBody {
  userId: string;
  username?: string;
  email?: string;
  address?: string;
  password?: string;
  wishlist?: number[];
  cart?: number[];
}

interface UpdateResponse {
  status: boolean;
  message: string;
}


export default function ProfilePage() {
const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  //Bu FetchUserProfile fonksiyonunun düzeltilmesi lazım yine cookieyi otamatik getiremedim amk logine istek attım o yüzdne kendi bilgilerimle
  //burayı düzeltek
  useEffect(() => {
    const fetchUserProfile = async () => {
      let token = Cookies.get("token");

      if (!token) {
  console.log("No token found. Sending login request...");

  try {
    const loginResponse = await fetch("http://localhost:9000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: "sellmanyilmazz@gmail.com", 
        password: "Slmnylmz.2002"
      }),
    });

    
    if (!loginResponse.ok) {
      throw new Error(`Login request failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json().catch(() => {
      throw new Error("Failed to parse login response JSON.");
    });

    if (loginData.status && loginData.token) {
      token = loginData.token as string;
      Cookies.set("token", token);
    } else {
      throw new Error(loginData.message || "Login failed. Invalid credentials or server error.");
    }

  } catch (err: any) {
    setError(err.message || "Unexpected error during login.");
    setLoading(false);
    return;
  }
}


      let userId = "";
      try {
        const decoded: { id: string } = jwtDecode(token);
        userId = decoded.id;
      } catch {
        setError("Couldn't read session info—please log in again.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:9000/api/auth/user/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (data.status) {
          setUser(data.user);
          setEditedUser(data.user);
        } else {
          setError(data.message || "Failed to load user data.");
        }
      } catch (err) {
        setError("Error fetching user data—please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleEditToggle = () => {
    if (isEditing) {
      setEditedUser(user);
    }
    setIsEditing(!isEditing);
    setUpdateSuccess(false);
  };

  const handleInputChange = (field: keyof User, value: string) => {
    if (editedUser) {
      setEditedUser({ ...editedUser, [field]: value });
    }
  };

const handleUpdateProfile = async () => {
  if (!editedUser || !user) return;

  setUpdateLoading(true);
  setUpdateSuccess(false);

  try {
    const token = Cookies.get("token");

    const updateBody: UpdateBody = {
      userId: user.id,
      username: editedUser.username !== user.username ? editedUser.username : undefined,
      email: editedUser.email !== user.email ? editedUser.email : undefined,
      address: editedUser.address !== user.address ? editedUser.address : undefined,
      wishlist: JSON.stringify(editedUser.wishlist) !== JSON.stringify(user.wishlist) ? editedUser.wishlist : undefined,
      cart: JSON.stringify(editedUser.cart) !== JSON.stringify(user.cart) ? editedUser.cart : undefined,
    };

    const response = await fetch("http://localhost:9000/api/auth/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateBody),
    });

    const data: UpdateResponse = await response.json();

    if (data.status) {
      setUser(editedUser);
      setIsEditing(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } else {
      setError(data.message || "Failed to update profile.");
    }
  } catch (err) {
    setError("Error updating profile—please try again later.");
    console.error(err);
  } finally {
    setUpdateLoading(false);
  }
};

//Yani change passwrod diye bir backend lazım password değişimi için
    // Burada backend'e istek atılacak
  const handleChangePassword = () => {
    console.log("Change password button clicked");
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:9000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (data.status) {
        router.push('/auth/login');;
      } else {
        setError("Failed to logout. Please try again.");
      }
    } catch (err) {
      setError("Error during logout. Please try again later.");
      console.error("Error during logout:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="bg-red-50 border border-black-200 rounded-xl p-6 inline-block">
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-gray-600">User information not found</p>
          </div>
        </div>
      </div>
    );
  }

  const formatRegistrationDate = (dateString: string) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric' 
    }).format(date);
  };

  const registrationDate = "2023-10-25";

  return (
    <div className="min-h-screen bg-white">
      <div className="w-screen">

        <div className="flex min-h-screen">
          {/* Left Sidebar */}
          <div className="w-1/4 bg-black text-white p-10 flex flex-col justify-center">
            <div className="space-y-8">
              {/* Success Message */}
              {updateSuccess && (
                <div className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 flex items-center gap-2">
                  <Check size={16} />
                  <span className="text-sm font-medium">Profile updated successfully!</span>
                </div>
              )}
              
              {/* Profile Header */}
              <div>
                <h1 className="text-5xl font-bold mb-4">My Profile</h1>
                <p className="text-gray-300 text-lg">Manage your account information and preferences</p>
              </div>

              {/* Avatar Section */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-white bg-opacity-10 rounded-full flex items-center justify-center border-2 border-white border-opacity-20">
                    <User className="text-white" size={28} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-black flex items-center justify-center">
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">{user.username}</h2>
                  <p className="text-gray-300">Member since {formatRegistrationDate(registrationDate)}</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white bg-opacity-5 rounded-lg text-black border border-white border-opacity-10">
                  <div className="flex items-center gap-3">
                    <Heart size={20} />
                    <span>Favorites</span>
                  </div>
                  <span className="font-semibold text-xl">{user.wishlist ? user.wishlist.length : 0}</span>
                </div>
                
                <div className="flex items-center justify-between p-4 text-black bg-white bg-opacity-5 rounded-lg border border-white border-opacity-10">
                  <div className="flex items-center gap-3">
                    <ShoppingBag size={20} />
                    <span>Orders</span>
                  </div>
                  <span className="font-semibold text-xl">12</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button 
                  onClick={handleChangePassword}
                  className="w-full bg-white bg-opacity-10 hover:bg-opacity-20 text-black rounded-lg px-6 py-3 font-medium transition-all border border-white border-opacity-20 hover:border-opacity-40"
                >
                  Change Password
                </button>
                
                <button 
                  onClick={handleLogout}
                  className="w-full bg-white text-black hover:bg-gray-100 rounded-lg px-6 py-3 font-medium transition-all"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="w-2/3 bg-gray-50 p-12">
            <div className="max-w-4xl">
              {/* Edit Toggle */}
              <div className="flex justify-end mb-8">
                {isEditing ? (
                  <div className="flex gap-3">
                    <button
                      onClick={handleUpdateProfile}
                      disabled={updateLoading}
                      className="bg-black hover:bg-gray-800 text-white rounded-lg px-6 py-2 flex items-center gap-2 font-medium transition-all disabled:opacity-50"
                    >
                      {updateLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Save size={16} />
                      )}
                      Save Changes
                    </button>
                    <button
                      onClick={handleEditToggle}
                      className="bg-white hover:bg-gray-100 text-black border border-gray-300 rounded-lg px-6 py-2 flex items-center gap-2 font-medium transition-all"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEditToggle}
                    className="bg-black hover:bg-gray-800 text-white rounded-lg px-6 py-2 flex items-center gap-2 font-medium transition-all"
                  >
                    <Edit2 size={16} />
                    Edit Profile
                  </button>
                )}
              </div>

              {/* Profile Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Username Card */}
                <div className="bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                      <User className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Username</p>
                    </div>
                  </div>
                  
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser?.username || ''}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className="w-full text-2xl font-semibold text-black bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  ) : (
                    <p className="text-2xl font-semibold text-black">{user.username}</p>
                  )}
                </div>

                {/* Email Card */}
                <div className="bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                      <Mail className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Email Address</p>
                    </div>
                  </div>
                  
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedUser?.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full text-2xl font-semibold text-black bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  ) : (
                    <p className="text-2xl font-semibold text-black break-all">{user.email}</p>
                  )}
                </div>

                {/* Registration Date Card */}
                <div className="bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                      <Calendar className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Member Since</p>
                    </div>
                  </div>
                  <p className="text-2xl font-semibold text-black">{formatRegistrationDate(registrationDate)}</p>
                </div>

                {/* Address Card */}
                <div className="bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                      <Truck className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Shipping Address</p>
                    </div>
                  </div>
                  
                  {isEditing ? (
                    <textarea
                      value={editedUser?.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={3}
                      className="w-full text-lg font-semibold text-black bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                      placeholder="Enter your shipping address"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-black">{user.address || "No address provided"}</p>
                  )}
                </div>
              </div>

              {/* Quick Links */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
  onClick={() => router.push('/favorites')}
  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer group"
>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Heart className="text-gray-600 group-hover:text-black transition-colors" size={24} />
                      <div>
                        <h3 className="font-semibold text-black">My Wishlist</h3>
                        <p className="text-gray-500 text-sm">{user.wishlist ? user.wishlist.length : 0} items saved</p>
                      </div>
                    </div>
                    <div className="text-black font-bold text-lg">→</div>
                  </div>
                </div>

                <div
  onClick={() => router.push('/order')}
  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer group"
>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="text-gray-600 group-hover:text-black transition-colors" size={24} />
                      <div>
                        <h3 className="font-semibold text-black">Order History</h3>
                        <p className="text-gray-500 text-sm">View past purchases</p>
                      </div>
                    </div>
                    <div className="text-black font-bold text-lg">→</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
