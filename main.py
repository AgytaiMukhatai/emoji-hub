from fastapi import FastAPI, Query
import requests
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

EMOJI_API = "https://emojihub.yurace.pro/api/all"




@app.get("/emoji")
def get_emojis(
    search: str | None = Query(None, description="Search by name"),
    category: str | None = Query(None, description="Filter by category"),
    sort: str | None = Query(None, description="Sort by 'name' or 'category'"),
    page: int = Query(1, ge=1, description="Page number (>=1)"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page (1-100)")
):
    """
    Получаем эмодзи из EmojiHub и добавляем:
    - поиск по имени
    - фильтр по категории
    - сортировку
    - пагинацию
    - список категорий (всегда полный)
    """
    response = requests.get(EMOJI_API)
    if response.status_code != 200:
        return {"error": "Failed to fetch emojis"}

    all_data = response.json()  # полный список
    data = all_data[:]          # рабочая копия

    # 🔍 Поиск
    if search:
        data = [e for e in data if search.lower() in e["name"].lower()]

    # 🗂 Фильтрация по категории (гибкая проверка)
    if category:
        data = [e for e in data if category.lower() in e["category"].lower()]

    # ↕️ Сортировка
    if sort == "name":
        data.sort(key=lambda e: e["name"])
    elif sort == "category":
        data.sort(key=lambda e: e["category"])

    total = len(data)

    # 📄 Пагинация
    start = (page - 1) * page_size
    end = start + page_size
    paginated = data[start:end]

    # 🔖 Всегда возвращаем все категории из полного списка
    categories = sorted(set(e["category"] for e in all_data))

    return {
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": (total + page_size - 1) // page_size,
        "items": paginated,
        "categories": categories,
    }
