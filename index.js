const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Начальное состояние
let state = {
  selectedItems: [], // Храним только значения (value) выбранных элементов
  sortedItems: Array.from({ length: 1000000 }, (_, i) => ({
    value: i + 1, // Значение элемента
    order: i + 1, // Порядковый номер
  })),
  search: ''
};

// Получение элементов с пагинацией и поиском
app.get("/api/items", (req, res) => {
  const {search, offset = 0, limit = 20 } = req.query;
  let items = state.sortedItems;
  state.search = search;
  // Фильтрация по поисковому запросу (если есть)
  if (search) {
    items = items.filter((item) => item.value.toString().includes(search));
  }

  // Пагинация
  const paginatedItems = items.slice(
    Number(offset),
    Number(offset) + Number(limit)
  );

  res.json({
    items: paginatedItems,
    total: items.length,
    hasMore: Number(offset) + Number(limit) < items.length,
  });
});

// Получение текущего состояния
app.get("/api/state", (req, res) => {
  const { search = state.search, offset = 0, limit = 20 } = req.query;
  let items = state.sortedItems;
    // Фильтрация по поисковому запросу (если есть)
    if (search) {
        items = items.filter((item) => item.value.toString().includes(search));
      }

  res.json({
    search: state.search ?? '',
    selectedItems: state.selectedItems,
    sortedItems: items.slice(offset, offset + limit), // Возвращаем первые 20 элементов
  });
});

// Обновление состояния
app.post("/api/state", (req, res) => {
  const { selectedItems, sortedItems } = req.body;

  // Обновляем выбранные элементы
  if (selectedItems) {
    state.selectedItems = selectedItems;
  }

  // Обновляем порядок элементов (если переданы)
  if (sortedItems && sortedItems.length > 0) {
    // Создаем карту для быстрого поиска
    const sortedItemsMap = new Map(
      sortedItems.map((item) => [item.value, item])
    );

    // Обновляем порядок в основном массиве
    state.sortedItems = state.sortedItems
      .map((item) => {
        return sortedItemsMap.get(item.value) || item;
      })
      .sort((a, b) => a.order - b.order);
  }

  res.json({ success: true });
});

// Запуск сервера
app.listen(5000, () => {
  console.log("Сервер запущен на http://localhost:5000");
});

module.exports = app;
