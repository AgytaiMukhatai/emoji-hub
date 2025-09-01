"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

type Emoji = {
  name: string;
  category: string;
  htmlCode: string[];
};

export default function EmojiList() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 1000);
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["emojis", debouncedSearch, category, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: "20",
      });

      if (debouncedSearch) params.append("search", debouncedSearch);
      if (category) params.append("category", category);

      const res = await fetch(`http://127.0.0.1:8000/emoji?${params.toString()}`);
      if (!res.ok) throw new Error("Ошибка загрузки");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="emoji-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton-card"></div>
        ))}
      </div>
    );
  }
  if (error) return <p>❌ Ошибка загрузки эмодзи</p>;

  return (
    <div className="emoji-container">
      {/* 🔍 Поиск */}
      <input
        type="text"
        placeholder="Поиск эмодзи..."
        className="search-input"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      {/* 🗂 Категории */}
      <div className="categories">
        <button
          className={`btn ${category === "" ? "btn-red" : "btn-outline"}`}
          onClick={() => {
            setCategory("");
            setPage(1);
          }}
        >
          Все
        </button>
        {data.categories?.map((c: string) => (
          <button
            key={c}
            className={`btn ${category === c ? "btn-red" : "btn-outline"}`}
            onClick={() => {
              setCategory(c);
              setPage(1);
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* 😀 Список эмодзи */}
      <div className="emoji-grid">
        {data.items.map((emoji: Emoji, i: number) => (
          <div key={i} className="emoji-card">
            <span className="text-3xl mb-2">
                {String.fromCodePoint(parseInt(emoji.htmlCode[0].replace("&#", "").replace(";", ""), 10))}
            </span>
            <p className="emoji-name">{emoji.name}</p>
            <p className="emoji-category">{emoji.category}</p>
          </div>
        ))}
      </div>

      {/* 📄 Пагинация */}
      <div className="pagination">
        <button
          className="btn btn-outline"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          ⬅ Назад
        </button>
        <span>
          Страница {data.page} из {data.total_pages}
        </span>
        <button
          className="btn btn-outline"
          disabled={page >= data.total_pages}
          onClick={() => setPage((p) => p + 1)}
        >
          Вперёд ➡
        </button>
      </div>
    </div>
  );
}
