const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

let state = {
  selectedItems: [],
  sortedItems: Array.from({ length: 1000000 }, (_, i) => i + 1),
};

app.get("/api/items", (req, res) => {
  const { search, offset = 0, limit = 20 } = req.query;
  let items = state.sortedItems;

  if (search) {
    items = items.filter((item) => item.toString().includes(search));
  }

  const paginatedItems = items.slice(
    Number(offset),
    Number(offset) + Number(limit)
  );

  res.json({
    items: paginatedItems,
    total: items.length,
    hasMore: offset + limit < items.length,
  });
});

app.get("/api/state", (req, res) => {
  res.json({
    selectedItems: state.selectedItems,
    sortedItems: state.sortedItems.slice(0, 20),
  });
});

app.post("/api/state", (req, res) => {
  const { selectedItems, sortedItems } = req.body;
  state.selectedItems = selectedItems || [];

  if (sortedItems && sortedItems.length > 0) {
    const remainingItems = state.sortedItems.filter(
      (item) => !sortedItems.includes(item)
    );
    state.sortedItems = [...sortedItems, ...remainingItems];
  }

  res.json({ success: true });
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});


module.exports = app;