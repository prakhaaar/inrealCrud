import asyncHandler from "express-async-handler";
import TaskModel from "../../model/task/TaskModel.js";

// CREATE a new task
export const createTask = asyncHandler(async (req, res) => {
  try {
    const { title, description, dueDate, priority, status } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Title is required!" });
    }

    if (!description || description.trim() === "") {
      return res.status(400).json({ message: "Description is required!" });
    }

    const task = new TaskModel({
      title,
      description,
      dueDate,
      priority,
      status,
      user: req.user._id,
    });

    await task.save();

    return res.status(201).json(task);
  } catch (error) {
    console.error("Error in createTask:", error);
    return res.status(500).json({ message: error.message });
  }
});

// GET all tasks for a user
export const getTasks = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(400).json({ message: "User not found!" });
    }

    const tasks = await TaskModel.find({ user: userId }).lean();

    return res.status(200).json({
      length: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Error in getTasks:", error);
    return res.status(500).json({ message: error.message });
  }
});

// GET a single task by ID
export const getTask = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Please provide a task id" });
    }

    const task = await TaskModel.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found!" });
    }

    if (!task.user.equals(userId)) {
      return res.status(401).json({ message: "Not authorized!" });
    }

    return res.status(200).json(task);
  } catch (error) {
    console.error("Error in getTask:", error);
    return res.status(500).json({ message: error.message });
  }
});

// UPDATE a task
export const updateTask = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { title, description, dueDate, priority, status, completed } =
      req.body;

    if (!id) {
      return res.status(400).json({ message: "Please provide a task id" });
    }

    const task = await TaskModel.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found!" });
    }

    if (!task.user.equals(userId)) {
      return res.status(401).json({ message: "Not authorized!" });
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.dueDate = dueDate || task.dueDate;
    task.priority = priority || task.priority;
    task.status = status || task.status;
    task.completed = completed ?? task.completed;

    await task.save();

    return res.status(200).json(task);
  } catch (error) {
    console.error("Error in updateTask:", error);
    return res.status(500).json({ message: error.message });
  }
});

// DELETE a single task
export const deleteTask = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const task = await TaskModel.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found!" });
    }

    if (!task.user.equals(userId)) {
      return res.status(401).json({ message: "Not authorized!" });
    }

    await TaskModel.findByIdAndDelete(id);

    return res.status(200).json({ message: "Task deleted successfully!" });
  } catch (error) {
    console.error("Error in deleteTask:", error);
    return res.status(500).json({ message: error.message });
  }
});

// DELETE all tasks of a user
export const deleteAllTasks = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const tasks = await TaskModel.find({ user: userId });

    if (!tasks || tasks.length === 0) {
      return res.status(404).json({ message: "No tasks found!" });
    }

    await TaskModel.deleteMany({ user: userId });

    return res.status(200).json({ message: "All tasks deleted successfully!" });
  } catch (error) {
    console.error("Error in deleteAllTasks:", error);
    return res.status(500).json({ message: error.message });
  }
});
