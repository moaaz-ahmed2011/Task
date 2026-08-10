class Task {
  #status = "Pending";

  constructor(id, title, description, dueDate, priority) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.priority = priority;
  }

  get status() {
    return this.#status;
  }

  set status(value) {
    const allowed = ["Pending", "In Progress", "Completed"];

    if (allowed.includes(value)) {
      this.#status = value;
    }
  }

  nextStatus() {
    if (this.#status === "Pending") {
      this.#status = "In Progress";
    } else if (this.#status === "In Progress") {
      this.#status = "Completed";
    } else {
      this.#status = "Pending";
    }
  }
}

let tasks = [];
let editingTaskId = null;

const form = document.getElementById("task-form");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const dueDateInput = document.getElementById("dueDate");
const priorityInput = document.getElementById("priority");
const searchInput = document.getElementById("search");
const filterStatus = document.getElementById("filterStatus");
const tasksContainer = document.getElementById("tasks-container");
const lightBtn = document.getElementById("light-btn");
const darkBtn = document.getElementById("dark-btn");
const saveBtn = document.getElementById("save-btn");


function loadTasks() {
  const saved = localStorage.getItem("tasks");

  if (!saved) {
    return;
  }

  try {
    const parsed = JSON.parse(saved);

    tasks = parsed.map((data) => {
      const task = new Task(
        data.id,
        data.title,
        data.description,
        data.dueDate,
        data.priority
      );

      task.status = data.status || "Pending";

      return task;
    });
  } catch (error) {
    console.error("Could not load tasks:", error);
    tasks = [];
  }
}


function saveTasks() {
  const dataToSave = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    dueDate: task.dueDate,
    priority: task.priority,
    status: task.status
  }));

  localStorage.setItem("tasks", JSON.stringify(dataToSave));
}


function validateTask() {
  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const dueDate = dueDateInput.value;
  const priority = priorityInput.value;

  if (!title) {
    alert("Please enter a task title.");
    return false;
  }

  if (!description) {
    alert("Please enter a description.");
    return false;
  }

  if (!dueDate) {
    alert("Please select a due date.");
    return false;
  }

  if (!priority) {
    alert("Please select a priority.");
    return false;
  }

  return true;
}


form.addEventListener("submit", function (e) {
  e.preventDefault();

  if (!validateTask()) {
    return;
  }

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const dueDate = dueDateInput.value;
  const priority = priorityInput.value;

  if (editingTaskId !== null) {
    const task = tasks.find((t) => t.id === editingTaskId);

    if (task) {
      task.title = title;
      task.description = description;
      task.dueDate = dueDate;
      task.priority = priority;
    }

    editingTaskId = null;
    saveBtn.textContent = "SAVE";
  } else {
    const newId =
      tasks.length > 0
        ? Math.max(...tasks.map((t) => t.id)) + 1
        : 1;

    const newTask = new Task(
      newId,
      title,
      description,
      dueDate,
      priority
    );

    tasks.push(newTask);
  }

  saveTasks();
  renderTasks();
  form.reset();
});


function renderTasks() {
  tasksContainer.replaceChildren();

  const searchValue = searchInput.value.trim().toLowerCase();
  const selectedStatus = filterStatus.value;

  let filtered = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchValue)
  );

  if (selectedStatus !== "All") {
    filtered = filtered.filter(
      (task) => task.status === selectedStatus
    );
  }

  if (filtered.length === 0) {
    const noTasks = document.createElement("p");

    noTasks.className = "no-tasks";
    noTasks.textContent = "No tasks found.";

    tasksContainer.appendChild(noTasks);

    return;
  }

  filtered.forEach((task) => {
    const card = document.createElement("div");

    card.className = `task ${task.priority.toLowerCase()}`;
    card.dataset.id = task.id;

    const title = document.createElement("h3");
    title.textContent = task.title;

    const description = document.createElement("p");
    const descriptionStrong = document.createElement("strong");

    descriptionStrong.textContent = "Description:";
    description.appendChild(descriptionStrong);
    description.append(` ${task.description}`);

    const dueDate = document.createElement("p");
    const dueDateStrong = document.createElement("strong");

    dueDateStrong.textContent = "Due Date:";
    dueDate.appendChild(dueDateStrong);
    dueDate.append(` ${task.dueDate}`);

    const priority = document.createElement("p");
    const priorityStrong = document.createElement("strong");

    priorityStrong.textContent = "Priority:";
    priority.appendChild(priorityStrong);
    priority.append(` ${task.priority}`);

    const status = document.createElement("p");
    const statusStrong = document.createElement("strong");

    statusStrong.textContent = "Status:";
    status.appendChild(statusStrong);
    status.append(` ${task.status}`);

    const buttons = document.createElement("div");
    buttons.className = "buttons";

    const editButton = document.createElement("button");
    editButton.className = "edit";
    editButton.dataset.action = "edit";
    editButton.type = "button";
    editButton.textContent = "Edit";

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete";
    deleteButton.dataset.action = "delete";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";

    const statusButton = document.createElement("button");
    statusButton.className = "status-btn";
    statusButton.dataset.action = "status";
    statusButton.type = "button";
    statusButton.textContent = "Change Status";

    buttons.appendChild(editButton);
    buttons.appendChild(deleteButton);
    buttons.appendChild(statusButton);

    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(dueDate);
    card.appendChild(priority);
    card.appendChild(status);
    card.appendChild(buttons);

    tasksContainer.appendChild(card);
  });
}


searchInput.addEventListener("input", renderTasks);


filterStatus.addEventListener("change", () => {
  sessionStorage.setItem(
    "taskFilter",
    filterStatus.value
  );

  renderTasks();
});


function loadSessionFilter() {
  const saved = sessionStorage.getItem("taskFilter");

  if (saved) {
    filterStatus.value = saved;
  }
}


tasksContainer.addEventListener("click", function (e) {
  const button = e.target.closest("button");

  if (!button) {
    return;
  }

  const card = button.closest(".task");

  if (!card) {
    return;
  }

  const id = Number(card.dataset.id);
  const action = button.dataset.action;

  if (action === "edit") {
    editTask(id);
  }

  if (action === "delete") {
    deleteTask(id);
  }

  if (action === "status") {
    changeStatus(id);
  }
});


function editTask(id) {
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return;
  }

  titleInput.value = task.title;
  descriptionInput.value = task.description;
  dueDateInput.value = task.dueDate;
  priorityInput.value = task.priority;

  editingTaskId = id;
  saveBtn.textContent = "UPDATE TASK";

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


function deleteTask(id) {
  const confirmed = confirm(
    "Are you sure you want to delete this task?"
  );

  if (!confirmed) {
    return;
  }

  tasks = tasks.filter((t) => t.id !== id);

  saveTasks();
  renderTasks();
}


function changeStatus(id) {
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return;
  }

  task.nextStatus();

  saveTasks();
  renderTasks();
}


lightBtn.addEventListener("click", () => {
  document.body.classList.remove("dark");
  document.body.classList.add("light");

  document.cookie =
    "theme=light; max-age=31536000; path=/";
});


darkBtn.addEventListener("click", () => {
  document.body.classList.remove("light");
  document.body.classList.add("dark");

  document.cookie =
    "theme=dark; max-age=31536000; path=/";
});


function getThemeFromCookie() {
  const cookies = document.cookie.split(";");

  for (let cookie of cookies) {
    cookie = cookie.trim();

    if (cookie.startsWith("theme=")) {
      return cookie.substring(6);
    }
  }

  return null;
}


function loadTheme() {
  const theme = getThemeFromCookie();

  if (theme === "dark") {
    document.body.classList.remove("light");
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
    document.body.classList.add("light");
  }
}


function checkReminders() {
  const today = new Date();

  tasks.forEach((task) => {
    if (task.status === "Completed") {
      return;
    }

    const due = new Date(task.dueDate);
    const diffDays =
      (due - today) / (1000 * 60 * 60 * 24);

    if (diffDays >= 0 && diffDays <= 1) {
      console.log(
        `Reminder: "${task.title}" is due soon!`
      );
    }
  });
}


setInterval(checkReminders, 60000);


window.addEventListener("storage", (e) => {
  if (e.key === "tasks") {
    loadTasks();
    renderTasks();
  }
});


loadSessionFilter();
loadTheme();
loadTasks();
renderTasks();
checkReminders();
