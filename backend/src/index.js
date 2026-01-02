const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 AS ok");
    res.json({ status: "ok", db: rows[0].ok === 1 });
  } catch (e) {
    res.status(500).json({ status: "error", error: e.message });
  }
});

app.get("/tasks", async (req, res) => {
  const { month } = req.query; 

  try {
    let sql = `
      SELECT id, task_date, title, notes, is_done, created_at, updated_at
      FROM tasks
    `;
    const params = [];

    if (month) {
      sql += " WHERE DATE_FORMAT(task_date, '%Y-%m') = ?";
      params.push(month);
    }

    sql += " ORDER BY task_date ASC, id ASC";

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// create task
app.post("/tasks", async (req, res) => {
  const { task_date, title, notes } = req.body;

  if (!task_date || !title) {
    return res.status(400).json({ error: "task_date and title are required" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO tasks (task_date, title, notes) VALUES (?, ?, ?)",
      [task_date, title, notes || null]
    );

    res.status(201).json({
      id: result.insertId,
      task_date,
      title,
      notes: notes || null,
      is_done: false,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// update task
app.put("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { title, notes, is_done } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE tasks
       SET title = COALESCE(?, title),
           notes = COALESCE(?, notes),
           is_done = COALESCE(?, is_done)
       WHERE id = ?`,
      [title, notes, is_done, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// delete task
app.delete("/tasks/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      "DELETE FROM tasks WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API running on port ${port}`));

