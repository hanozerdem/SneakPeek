"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

  export default function HomePage() {
    const [scrollY, setScrollY] = useState(0);
    const router = useRouter();
    const [scaleFactor, setScaleFactor] = useState(1.1);
  
    useEffect(() => {
      const handleScroll = () => {
        setScrollY(window.scrollY);
        setScaleFactor(Math.min(1.1 + window.scrollY / window.innerHeight, 1.4));
      };
  
      window.addEventListener("scroll", handleScroll);
  
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);
  
    return (
    <div className="bg-gray-100 min-h-screen overflow-hidden">
      {/* Swiper Bullet Renkleri */}
      <style jsx global>{`
        .swiper-pagination-bullet {
          background-color: #4b0082 !important;
          opacity: 0.5;
        }

        .swiper-pagination-bullet-active {
          background-color: #4b0082 !important;
          opacity: 1;
        }
      `}</style>

      {/* Hero Section */}
      <div
        className="relative flex flex-col justify-center items-center py-16 w-full bg-cover bg-center"
        style={{
          backgroundImage: "url('/background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Swiper
  modules={[Pagination]}
  pagination={{ clickable: true }}
  className="w-full max-w-5xl h-[500px] sm:h-[400px] md:h-[500px] lg:h-[600px]"
>
  {[
    {
      imageUrl: "https://sneakerbaker.com/wp-content/uploads/2021/09/Nike-Air-Jordan-1-Mid-SE-Purple-.png",
      productId: 9,
    },
    {
      imageUrl: "https://sneakerbaker.com/wp-content/uploads/2022/11/Nike-Air-Jordan-1-Mid-Lakers-2022.png",
      productId: 13,
    },
    {
      imageUrl: "https://sneakerbaker.com/wp-content/uploads/2022/04/Nike-Air-Jordan-1-High-Element-Gore-Tex-Light-Curry.png",
      productId: 14,
    },
  ].map(({ imageUrl, productId }, index) => (
    <SwiperSlide key={index} className="flex justify-center items-center">
      <div className="relative text-center w-full">
        <div
          className="relative mx-auto w-[320px] sm:w-[420px] md:w-[520px] h-[320px] sm:h-[420px] md:h-[520px] transition-transform duration-300 ease-out cursor-pointer"
          style={{ transform: `scale(${scaleFactor})` }}
          onClick={() => router.push(`/products/${productId}`)}
        >
          <Image
            src={imageUrl}
            alt={`Sneaker ${index + 1}`}
            layout="fill"
            objectFit="contain"
            className="rotate-[25deg]"
          />
        </div>
      </div>
    </SwiperSlide>
  ))}
</Swiper>

        {/* Scroll Indicator */}
        <div
          className={`absolute bottom-4 transition-opacity duration-500 ${
            scrollY > 50 ? "opacity-0" : "opacity-100"
          }`}
        >
          <p className="text-black font-semibold text-sm">SCROLL TO EXPLORE</p>
          <div className="w-[2px] h-6 bg-black mx-auto mt-1"></div>
        </div>
      </div>

      {/* Ayakkabı Kartları Bölümü */}
<div className="flex justify-center gap-10 mt-16 px-8">
  {/* Kart 1 */}
  <div
    onClick={() => router.push("/products/10")}
    className="bg-[#F3F2F8] shadow-xl rounded-xl p-8 flex flex-col items-center w-[380px] md:w-[420px] lg:w-[460px] transition-transform hover:scale-105 relative cursor-pointer"
  >
    <Image
      src="https://sneakerbaker.com/wp-content/uploads/2022/06/Nike-Air-Jordan-1-Low-Tie-Dye.png"
      alt="Air Jordan 1 Mid Light Smoke Grey"
      width={320}
      height={200}
      className="object-contain rotate-12"
    />
    <h3 className="text-lg font-bold mt-4 text-gray-500">NEW</h3>
    <p className="text-gray-900 text-lg text-center font-semibold">
      AIR JORDAN 1 MID LIGHT GREY
    </p>

    {/* Ok Butonu */}
    <div className="mt-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition">
      <span className="text-black text-xl">→</span>
    </div>
  </div>

  {/* Kart 2 */}
  <div
    onClick={() => router.push("/products/11")}
    className="bg-[#F3F2F8] shadow-xl rounded-xl p-8 flex flex-col items-center w-[380px] md:w-[420px] lg:w-[460px] transition-transform hover:scale-105 relative cursor-pointer"
  >
    <Image
      src="https://sneakerbaker.com/wp-content/uploads/2022/12/Converse-Chuck-Taylor-All-Star-70-Hi-Comme-des-Garcons-PLAY-Black.png"
      alt="Converse PLAY Black"
      width={320}
      height={200}
      className="object-contain rotate-12"
    />
    <h3 className="text-lg font-bold mt-4 text-gray-500">NEW</h3>
    <p className="text-gray-900 text-lg text-center font-semibold">
      CONVERSE X CDG
    </p>

    {/* Ok Butonu */}
    <div className="mt-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition">
      <span className="text-black text-xl">→</span>
    </div>
  </div>
</div>
      {/* Yeni Metin Alanı */}
      <div className="text-center mt-20 px-6">
        <p className="text-3xl text-black m-6 font-extralight">At the moment</p>
        <h2 className="text-6xl font-extrabold italic text-black mt-2 m-6">
          SUMMERTIME MOOD
        </h2>
        <p className="text-3xl text-black mt-2 font-extralight">
          Fight the heat in a sunny look!
        </p>
      </div>

      <div className="mt-16">
  <div className="container mx-auto px-4">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-3xl font-extrabold text-black">Top Sneakers</h2>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Card 1 - Adidas Samba OG */}
      <div
        onClick={() => router.push("/products/1")}
        className="bg-[#F3F2F8] shadow-xl rounded-xl p-8 flex flex-col items-center transition-transform hover:scale-105 cursor-pointer min-h-[460px]"
      >
        <div className="w-[280px] h-[280px] flex items-center justify-center">
          <Image
            src="https://i.imgur.com/j3ZZq91.png"
            alt="Adidas Samba OG"
            width={260}
            height={260}
            className="object-contain rotate-12"
          />
        </div>
        <p className="text-gray-900 text-lg text-center font-semibold mt-2">
          ADIDAS SAMBA OG
        </p>
        <div className="mt-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition">
          <span className="text-black text-xl">→</span>
        </div>
      </div>

      {/* Card 2 - Converse CDG Blue */}
<div
  onClick={() => router.push("/products/12")}
  className="bg-[#F3F2F8] shadow-xl rounded-xl p-3 flex flex-col  items-center transition-transform hover:scale-105 cursor-pointer min-h-[460px]"
>
  {/* ↓ Burada items-end ile görseli kutunun dibine yaslıyoruz */}
  <div className="w-[280px] h-[280px] flex items-end justify-center">
    <Image
      src="https://sneakerbaker.com/wp-content/uploads/2022/03/Converse-Chuck-Taylor-All-Star-70-Hi-Comme-des-Garcons-PLAY-Blue.png"
      alt="Converse CDG Blue"
      width={260}
      height={260}
      className="object-contain rotate-12"
    />
  </div>
  <p className="text-gray-900 text-lg text-center font-semibold mt-2">
    CONVERSE X CDG PLAY BLUE
  </p>
  <div className="mt-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition">
    <span className="text-black text-xl">→</span>
  </div>
</div>




      {/* Card 3 - UGG M Classic Ultra Mini */}
      <div
        onClick={() => router.push("/products/6")}
        className="bg-[#F3F2F8] shadow-xl rounded-xl p-8 flex flex-col items-center transition-transform hover:scale-105 cursor-pointer min-h-[460px]"
      >
        <div className="w-[280px] h-[280px] flex items-center justify-center">
          <Image
            src="https://i.imgur.com/SvGchFO.png"
            alt="UGG M Classic"
            width={260}
            height={260}
            className="object-contain rotate-12"
          />
        </div>
        <p className="text-gray-900 text-lg text-center font-semibold mt-2">
          UGG M CLASSIC ULTRA MINI
        </p>
        <div className="mt-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition">
          <span className="text-black text-xl">→</span>
        </div>
      </div>
    </div>
  </div>
</div>

     {/* Buy by Category Bölümü */}
<div className="mt-16 px-4 md:px-20 lg:px-80">
  <div className="space-y-8">
    {/* 1) Workout */}
    <div className="flex flex-col md:flex-row items-center gap-4">
      {/* Yazı */}
      <div className="w-2/3 flex justify-center">
        <a className="text-lg font-extrabold italic tracking-wide text-black">
          WORKOUT
        </a>
      </div>
      {/* Resim */}
      <div className="w-full md:w-1/2">
        <div className="w-full h-[200px] md:h-[250px] overflow-hidden rounded-lg">
          <img
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2940&auto=format&fit=crop"
            alt="Workout"
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </div>

    {/* 2) Run (resim solda, yazı sağda) */}
    <div className="flex flex-col md:flex-row-reverse items-center gap-4">
      {/* Yazı */}
      <div className="w-2/3 flex justify-center">
        <a className="text-lg font-extrabold italic tracking-wide text-black">
          RUN
        </a>
      </div>
      {/* Resim */}
      <div className="w-full md:w-1/2">
        <div className="w-full h-[200px] md:h-[250px] overflow-hidden rounded-lg">
          <img
            src="https://images.unsplash.com/photo-1522040942177-269680274214?q=80&w=2787&auto=format&fit=crop"
            alt="Run"
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </div>

    {/* 3) Football */}
    <div className="flex flex-col md:flex-row items-center gap-4">
      {/* Yazı */}
      <div className="w-2/3 flex justify-center">
        <a className="text-lg font-extrabold italic tracking-wide text-black">
          FOOTBALL
        </a>
      </div>
      {/* Resim */}
      <div className="w-full md:w-1/2">
        <div className="w-full h-[200px] md:h-[250px] overflow-hidden rounded-lg">
          <img
            src="https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?q=80&w=2962&auto=format&fit=crop"
            alt="Football"
            className="object-cover w-full h-full"
          />
        </div>
      </div>
    </div>
  </div>
</div>


      {/* Motivasyon Yazısı */}
      <div className="w-full bg-[#edebf4] py-12 flex justify-center">
        <h2 className="text-2xl md:text-3xl font-bold italic text-black">
          LOOKS GOOD. RUNS GOOD. FEELS GOOD.
        </h2>
      </div>

      {/* Footer Bölümü */}
      <footer className="w-full bg-black py-12 flex flex-col items-center relative">
        {/* Orta Logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h2 className="text-4xl font-bold text-white tracking-wider">
            SneakPeek
          </h2>
        </div>

        {/* Sol ve Sağ Menü */}
        <div className="w-full flex justify-between px-16 text-white text-sm font-light">
          {/* Sol Menü */}
          <div className="flex flex-col space-y-2">
            <a
              href="/all"
              className="hover:text-gray-400 transition cursor-pointer"
            >
              ALL
            </a>
            <a
              href="/women"
              className="hover:text-gray-400 transition cursor-pointer"
            >
              WOMAN
            </a>
            <a
              href="/men"
              className="hover:text-gray-400 transition cursor-pointer"
            >
              MEN
            </a>
          </div>

          {/* Sağ Menü */}
          <div className="flex flex-col space-y-2 text-right">
            <a
              href="#workout"
              className="hover:text-gray-400 transition cursor-pointer"
            >
              WORKOUT
            </a>
            <a
              href="#run"
              className="hover:text-gray-400 transition cursor-pointer"
            >
              RUN
            </a>
            <a
              href="#football"
              className="hover:text-gray-400 transition cursor-pointer"
            >
              FOOTBALL
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
  }