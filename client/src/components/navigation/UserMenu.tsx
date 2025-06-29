"use client";

import { useState, useRef, useEffect } from "react";
import { FaUser } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGlobal } from "@/context/GlobalState";

const UserMenu = () => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { isLoggedIn, logout, refreshAuth } = useGlobal();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    router.push("/home");
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-black text-lg p-2 hover:opacity-75 transition"
      >
        <FaUser size={20} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-300 rounded shadow-md z-50">
          <div className="p-4 border-b font-bold flex justify-between items-center">
            {isLoggedIn ? "My Account" : "Entrance"} <FaUser />
          </div>
          <div className="p-4 space-y-2">
            {!isLoggedIn ? (
              <>
                <Link
                  href="/auth/register"
                  className="block text-black hover:text-red-500"
                  onClick={() => setOpen(false)}
                >
                  Register
                </Link>
                <Link
                  href="/auth/login"
                  className="block text-black hover:text-red-500"
                  onClick={() => setOpen(false)}
                >
                  Login
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/profile"
                  className="block text-black hover:text-red-500"
                  onClick={() => setOpen(false)}
                >
                  Profile Info
                </Link>
                <Link
                  href="/order"
                  className="block text-black hover:text-red-500"
                  onClick={() => setOpen(false)}
                >
                  Orders
                </Link>
                <Link
                  href="/address-book"
                  className="block text-black hover:text-red-500"
                  onClick={() => setOpen(false)}
                >
                  My Address Information
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-black hover:text-red-500 block"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
