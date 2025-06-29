"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaSearch, FaHeart, FaShoppingBag } from "react-icons/fa";
import UserMenu from "./UserMenu";
import { useGlobal } from "@/context/GlobalState";

class TrieNode {
  children: Record<string, TrieNode> = {};
  productIds: number[] = [];
  isEnd = false;
}

class Trie {
  root = new TrieNode();
  insert(word: string, productId: number) {
    let node = this.root;
    for (let ch of word.toLowerCase()) {
      if (!node.children[ch]) node.children[ch] = new TrieNode();
      node = node.children[ch];
    }
    node.isEnd = true;
    node.productIds.push(productId);
  }
  search(prefix: string): number[] {
    let node = this.root;
    for (let ch of prefix.toLowerCase()) {
      if (!node.children[ch]) return [];
      node = node.children[ch];
    }
    return this.collect(node);
  }
  collect(node: TrieNode, out: number[] = []): number[] {
    if (node.isEnd) out.push(...node.productIds);
    for (let c in node.children) this.collect(node.children[c], out);
    return out;
  }
}




export default function Navbar() {
  const path = usePathname();
  if (path.startsWith('/chatbot/embed')) return null;
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, refreshCart } = useGlobal();

  const [search, setSearch] = useState("");
  const [productMap, setProductMap] = useState<Record<number, { name: string; imageUrl: string }>>({});
  const [matchedIds, setMatchedIds] = useState<number[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const trieRef = useRef<Trie>(new Trie());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
const [checkDone, setCheckDone] = useState(false);

useEffect(() => {
  fetch("http://localhost:9000/api/auth/check", {
    method: "GET",
    credentials: "include",
  })
    .then(res => {
      setIsLoggedIn(res.ok);
      setCheckDone(true);
    })
    .catch(() => {
      setIsLoggedIn(false);
      setCheckDone(true);
    });
}, []);

  useEffect(() => {
    axios
      .get<{ status: boolean; products: { productName: string; productId: number; imageUrl: string }[] }>("http://localhost:9000/api/products/")
      .then((res) => {
        const data = res.data;
        if (data.status) {
          const map: Record<number, { name: string; imageUrl: string }> = {};
          for (let p of data.products) {
            trieRef.current.insert(p.productName, p.productId);
            map[p.productId] = {
              name: p.productName,
              imageUrl: p.imageUrl,
            };
            
            

          }
          setProductMap(map);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (search.trim()) {
      const prefixIds = trieRef.current.search(search); 
      const lowerSearch = search.toLowerCase();
  
      const includeIds = Object.entries(productMap)
        .filter(([id, product]) => product.name.toLowerCase().includes(lowerSearch))
        .map(([id]) => Number(id));
  
      // Filter out duplicate IDs and limit to 5
      const mergedIds = Array.from(new Set([...prefixIds, ...includeIds])).slice(0, 5);
  
      setMatchedIds(mergedIds);
    } else {
      setMatchedIds([]);
    }
  }, [search]);
  

  const handleSelect = (id: number) => {
    setSearch("");
    setMatchedIds([]);
    router.push(`/products/${id}`);
  };

  const handleEnterSearch = () => {
    if (search.trim()) {
      const normalizedSearch = encodeURIComponent(search.trim());
      router.push(`/products/all/tagged?tag=${normalizedSearch}&color=${normalizedSearch}`);
      setSearch("");
      setMatchedIds([]);
    }
  };

  return (
    <header className="fixed w-full z-20 bg-white shadow-md">
      <nav className="flex justify-between items-center px-8 py-4">
        <div className="flex items-center space-x-6">
          <Link href="/home" className="text-xl sm:text-2xl font-bold text-black">
            SNEAKPEEK
          </Link>
          <div className="hidden lg:flex space-x-6 text-lg font-medium text-black">
            {["woman", "men", "all"].map((seg) => (
              <Link
                href={`/products/${seg}`}
                key={seg}
                className={`cursor-pointer font-sans ${
                  pathname === `/products/${seg}`
                    ? "border-b-2 border-black font-bold"
                    : ""
                }`}
              >
                {seg.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>

        <div
          className="relative w-full max-w-md"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          tabIndex={0}
        >
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
            <FaSearch className="text-black" />
            <input
              type="text"
              placeholder="Search for Product, Brand or Category."
              className="ml-2 w-full bg-transparent outline-none text-black"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEnterSearch();
              }}
            />
          </div>
          {isFocused && matchedIds.length > 0 && (
            <ul className="absolute z-50 w-full bg-white border mt-1 rounded shadow-md">
              {matchedIds.map((id) => (
                <li
                  key={id}
                  onMouseDown={() => handleSelect(id)}
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100 text-sm"
                >
                  {
                    <div className="flex items-center gap-3">
                    <img
                      src={productMap[id]?.imageUrl}
                      alt={productMap[id]?.name}
                      width={40}
                      height={40}
                      className="object-contain rounded"
                    />
                    <span className="font-medium text-sm">{productMap[id]?.name}</span>
                  </div>                  
                  }
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center space-x-6 text-xl text-black">
          <Link href="/favorites">
            <FaHeart className="cursor-pointer" />
          </Link>
          <Link href="/cart" className="relative">
            <FaShoppingBag className="cursor-pointer" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {cartCount}
              </span>
            )}
          </Link>
          <UserMenu />
        </div>
      </nav>
      {checkDone && !isLoggedIn && (
      <div className="bg-black text-center text-sm text-white py-2 leading-tight">
        <p>Members: Free Shipping on Orders $50+</p>
        <Link
          href="/auth/register"
          className="underline font-semibold hover:text-gray-300 transition"
        >
          Join now
        </Link>
      </div> )
      }
    </header>
  );
}
