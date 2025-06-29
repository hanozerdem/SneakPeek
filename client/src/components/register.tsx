"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios"; 
import { Permanent_Marker } from "next/font/google";
import { Black_Ops_One } from "next/font/google";

const graffiti = Permanent_Marker({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-graffiti",
});

const blackOps = Black_Ops_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-graffiti",
});


export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    wishlist: [], 
    cart: []
  });


  useEffect(() => {
      async function checkAuth() {
        try {
          const res = await fetch("http://localhost:9000/api/auth/check", {
            method: "GET",
            credentials: "include", 
          });
          const data = await res.json();
          if (data.loggedIn) {
            router.push("/home");
          }
        } catch (error) {
          console.log("Auth error")
        }
      }
      checkAuth();
  }, [router]);
  
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: "", password: "" };

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }

    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:9000/api/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        wishlist: [], 
        cart:  []
      });

      if (!response) {
        setServerError("Invalid credentials.");
        return;
      }
      if (!response.data.status) {
        setServerError(response.data.message || "Invalid credentials.");
        return;
      }

      console.log("Server Response:", response.data);
      router.push("/auth/login");
    } catch (error: any) {
      console.error("Registration Error:", error.response?.data || error.message);
      setServerError(error.response?.data?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sol taraf: Görsel */}
      <div className="relative w-1/2 flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Sneakers"
          className="absolute w-full h-full object-cover"
        />
        <div className="absolute bottom-24 z-10">
        <h1 className={`${blackOps.variable} graffiti`}>SneakPeek</h1>
        </div>
        <style jsx>{`
        .graffiti {
          position: relative;
          display: inline-block;
          font-family: var(--font-graffiti), sans-serif;
          font-size: 5.5rem;
          line-height: 1;
          /* spray‑paint texture behind text */
          background: url("/spray-texture.png") center/cover no-repeat;
          -webkit-background-clip: text;
          color: white;
          /* thick dark outline */
          text-shadow:
            8px 2px 0 #111,
           -2px -2px 0 #111,
            2px -4px 0 #111,
           -2px  2px 0 #111;
        }

        /* little drips at the bottom of each letter */
        .graffiti::after {
          content: "SneakPeek";
          position: absolute;
          left: 0; top: 0;
          width: 100%; height: 100%;
          background: url("/drip-mask.svg") center/contain no-repeat;
          /* clip the drips into the text shape */
          -webkit-mask: url("/spray-texture.png") center/cover no-repeat,
                        url("/drip-mask.svg") center/contain no-repeat;
          mask-composite: exclude;
        }
      `}</style>
      </div>

      {/* Sağ taraf: Register Form */}
      <div className="w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          <h2 className="text-3xl font-semibold">Register</h2>

          {serverError && <p className="text-red-500 text-sm">{serverError}</p>}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Username */}
            <div>
              <label className="block text-sm font-medium">Your Username</label>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium">Login Details</label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                required
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                required
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
              <p className="text-xs text-gray-500">
                Minimum 8 characters with at least one uppercase, one lowercase, one special
                character and a number
              </p>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              className="w-full bg-black text-white p-3 rounded-md flex items-center justify-center"
              disabled={loading}
            >
              {loading ? "Registering..." : "REGISTER"}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-gray-800 font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
