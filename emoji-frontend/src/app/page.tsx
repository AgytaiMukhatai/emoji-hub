"use client";

import { useRouter } from "next/navigation";
import "./home.css";


export default function Home() {
  const router = useRouter();



  return (
    <div className="home-container">
      <div className="home-card">
        <h1 className="home-title">👋 Добро пожаловать!</h1>
        <p className="home-subtitle">
          Исследуй коллекцию эмодзи.  
          Легко ищи, фильтруй и находи нужные символы.
          
        </p>
        <button className="home-button" onClick={() => router.push("/emoji")}>
          🚀 Перейти к эмодзи
        </button>
      </div>
      
      <div className="attribution">
        <span className="made-by">Made with ❤️ by</span>
        <a 
          href="https://www.instagram.com/agyt.io/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="author-name"
        >
          Agytai Mukhatai
        </a>
      </div>
    </div>
  );
}
