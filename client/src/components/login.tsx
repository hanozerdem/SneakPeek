"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { useGlobal } from "@/context/GlobalState";
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

export default function LoginPage() {
  const router = useRouter();
  const { refreshAuth, refreshCart } = useGlobal();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [serverError, setServerError] = useState("");

  // Sync any locally‑stored cart items up to the server, then clear them
  const syncLocalCart = async () => {
    const cartStr = localStorage.getItem("cart");
    if (!cartStr) return;
  
    const localCart: any[] = JSON.parse(cartStr);
    if (localCart.length === 0) return;
  
    for (const item of localCart) {
      const payload = {
        productId: item.productId,
        size: item.size.toString(),
        quantity: item.quantity,
        price: item.price,
      };

      console.log(payload)
  
      try {
        const res = await fetch("http://localhost:9000/api/cart/add", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        console.log(res)
        
        if (!res.ok) {
          console.error(`Failed to sync item: ${item.productId}`);
        }
      } catch (err) {
        console.error(`Error syncing item: ${item.productId}`, err);
      }
    }
  
    // Bütün ürünler gönderildikten sonra temizle
    localStorage.removeItem("cart");
  };
  

  // If already logged in, redirect immediately and update global state
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("http://localhost:9000/api/auth/check", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (data.loggedIn) {
          await refreshAuth();
          await refreshCart();
          router.push("/home");
        }
      } catch {
        // If there is a mistake, go silent
      }
    }
    checkAuth();
  }, [router, refreshAuth, refreshCart]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setServerError("");
  
    try {
      const response = await axios.post(
        "http://localhost:9000/api/auth/login",
        {
          email: formData.email,
          password: formData.password,
        },
        { withCredentials: true }
      );
  
      if (!response.data.status) {
        setServerError(response.data.message || "Invalid credentials.");
        setLoading(false);
        return;
      }
  
      // 1. Login başarılı olduysa önce local cart'ı server'a taşı
      await syncLocalCart();
  
      // 2. Ardından global auth ve cart state'lerini güncelle
      await refreshAuth();
      await refreshCart();
  
      // 3. Sonra anasayfaya yönlendir
      router.push("/home");
  
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 400 || err.response.status === 422) {
          setServerError(err.response.data.message || "Invalid credentials.");
        } else {
          setServerError("An unexpected error occurred. Please try again.");
        }
      } else if (err.request) {
        setServerError("No response from server. Check your connection.");
      } else {
        setServerError("Error: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="flex h-screen">
      {/* Sol taraf: Resim ve Marka İsmi */}
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

      {/* Sağ taraf: Login Form */}
      <div className="w-1/2 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          <h2 className="text-2xl font-semibold">Login</h2>

          {serverError && (
            <p className="text-red-500 text-sm">{serverError}</p>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              required
            />
            <div className="text-right">
              <Link
                href="/auth/register"
                className="text-sm text-gray-600 hover:underline"
              >
                Forgot <span className="font-semibold">your</span> password?
              </Link>
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white p-3 rounded-md"
              disabled={loading}
            >
              {loading ? "Logging in..." : "LOGIN"}
            </button>
          </form>

          <p className="text-center">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="text-gray-800 font-semibold hover:underline"
            >
              Register
            </Link>
          </p>

          <p className="text-xs text-gray-500 text-center">
            By clicking 'Log In' you agree to our{" "}
            <a href="#" className="underline font-medium">
              Terms & Conditions
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
