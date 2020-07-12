(function () {
  let gets = get();
  if (gets == null || Object.values(gets).length == 0) emptyListMessage();

  const objOfTasks = gets == null ? {} : gets;

  const themes = {
    default: {
      "--base-text-color": "#212529",
      "--header-bg": "#007bff",
      "--header-text-color": "#fff",
      "--default-btn-bg": "#007bff",
      "--default-btn-text-color": "#fff",
      "--default-btn-hover-bg": "#0069d9",
      "--default-btn-border-color": "#0069d9",
      "--danger-btn-bg": "#dc3545",
      "--danger-btn-text-color": "#fff",
      "--danger-btn-hover-bg": "#bd2130",
      "--danger-btn-border-color": "#dc3545",
      "--input-border-color": "#ced4da",
      "--input-bg-color": "#fff",
      "--input-text-color": "#495057",
      "--input-focus-bg-color": "#fff",
      "--input-focus-text-color": "#495057",
      "--input-focus-border-color": "#80bdff",
      "--input-focus-box-shadow": "0 0 0 0.2rem rgba(0, 123, 255, 0.25)",
    },
    dark: {
      "--base-text-color": "#212529",
      "--header-bg": "#343a40",
      "--header-text-color": "#fff",
      "--default-btn-bg": "#58616b",
      "--default-btn-text-color": "#fff",
      "--default-btn-hover-bg": "#292d31",
      "--default-btn-border-color": "#343a40",
      "--default-btn-focus-box-shadow":
        "0 0 0 0.2rem rgba(141, 143, 146, 0.25)",
      "--danger-btn-bg": "#b52d3a",
      "--danger-btn-text-color": "#fff",
      "--danger-btn-hover-bg": "#88222c",
      "--danger-btn-border-color": "#88222c",
      "--input-border-color": "#ced4da",
      "--input-bg-color": "#fff",
      "--input-text-color": "#495057",
      "--input-focus-bg-color": "#fff",
      "--input-focus-text-color": "#495057",
      "--input-focus-border-color": "#78818a",
      "--input-focus-box-shadow": "0 0 0 0.2rem rgba(141, 143, 146, 0.25)",
    },
    light: {
      "--base-text-color": "#212529",
      "--header-bg": "#fff",
      "--header-text-color": "#212529",
      "--default-btn-bg": "#fff",
      "--default-btn-text-color": "#212529",
      "--default-btn-hover-bg": "#e8e7e7",
      "--default-btn-border-color": "#343a40",
      "--default-btn-focus-box-shadow":
        "0 0 0 0.2rem rgba(141, 143, 146, 0.25)",
      "--danger-btn-bg": "#f1b5bb",
      "--danger-btn-text-color": "#212529",
      "--danger-btn-hover-bg": "#ef808a",
      "--danger-btn-border-color": "#e2818a",
      "--input-border-color": "#ced4da",
      "--input-bg-color": "#fff",
      "--input-text-color": "#495057",
      "--input-focus-bg-color": "#fff",
      "--input-focus-text-color": "#495057",
      "--input-focus-border-color": "#78818a",
      "--input-focus-box-shadow": "0 0 0 0.2rem rgba(141, 143, 146, 0.25)",
    },
  };
  let lastSelectedTheme = localStorage.getItem("app_theme") || "default";

  let isClickedNotCompletedTasks = false; //если мы нажалт на кнопку незавершенные задачи
  let previousTaskClickedId; //id предыдущей кликнутой задачи
  let previousStateOfObjectWithUsers = false; //false - empty

  //Elements UI
  const listContainer = document.querySelector(
    ".tasks-list-section .list-group"
  );
  const form = document.forms["addTask"];
  const inputTitle = form.elements["title"];
  const inputBody = form.elements["body"];
  const notComplButton = document.querySelector("#notCompletedTasks");
  const allTasksButton = document.querySelector("#allTasks");
  const themeSelect = document.getElementById("themeSelect");

  //Events
  renderAllTasks(objOfTasks);
  setTheme(lastSelectedTheme);
  save();
  form.addEventListener("submit", onFormSubmitHandler);
  listContainer.addEventListener("click", onDeleteHandler);
  listContainer.addEventListener("click", onSubmitHandler);
  notComplButton.addEventListener("click", notCompletedTasksHandler);
  allTasksButton.addEventListener("click", onAllTaskButtonClickHandler);
  themeSelect.addEventListener("change", onThemeSelectHandler);

  function renderAllTasks(tasksList) {
    if (!tasksList) {
      console.error("Передайте список задач");
      return;
    }

    const fragment = document.createDocumentFragment();
    Object.values(tasksList).forEach((task) => {
      const li = listItemTemplate(task);
      if (li.classList.contains("completedTask")) {
        fragment.append(li);
      } else {
        fragment.prepend(li);
      }
    });
    listContainer.appendChild(fragment);
  }

  function listItemTemplate({ _id, title, body, completed } = {}) {
    const li = document.createElement("li");
    li.classList.add(
      "list-group-item",
      "d-flex",
      "align-items-center",
      "flex-wrap",
      "flex-row",
      "mt-2"
    );
    if (completed) li.classList.add("completedTask");
    li.setAttribute("data-task-id", _id);

    const span = document.createElement("span");
    span.textContent = title;
    span.style.fontWeight = "bold";

    const divWithButtons = document.createElement("div");
    divWithButtons.classList.add("d-flex", "flex-row", "ml-auto");

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete task";
    deleteBtn.classList.add("btn", "btn-danger", "ml-auto", "delete-btn");

    const completeBtn = document.createElement("button");
    completeBtn.textContent = "Complete task";
    completeBtn.classList.add("btn", "btn-success", "ml-1", "complete-btn");

    const article = document.createElement("p");
    article.textContent = body;
    article.classList.add("mt-2", "w-100");

    divWithButtons.appendChild(deleteBtn);
    divWithButtons.appendChild(completeBtn);

    li.appendChild(span);
    li.appendChild(article);
    li.appendChild(divWithButtons);

    return li;
  }

  function onFormSubmitHandler(e) {
    e.preventDefault();
    const titleValue = inputTitle.value;
    const bodyValue = inputBody.value;

    if (!titleValue || !bodyValue) {
      alert("Пожалуйста введите title и body");
      return;
    }
    const task = createNewTask(titleValue, bodyValue);
    const listItem = listItemTemplate(task);
    listContainer.insertAdjacentElement("afterbegin", listItem);

    form.reset();
    const listUl = document.querySelector(".list-group");

    if (listUl.children.length != 0 && !previousStateOfObjectWithUsers) {
      removeEmptyListMessage();
    }
  }

  function createNewTask(title, body) {
    const newTask = {
      title,
      body,
      completed: false,
      _id: `task-${Math.random()}`,
    };
    if (Object.values(objOfTasks).length == 0)
      previousStateOfObjectWithUsers = false;
    else previousStateOfObjectWithUsers = true;
    objOfTasks[newTask._id] = newTask;
    save();
    return { ...newTask };
  }

  function deleteTask(id) {
    const { title } = objOfTasks[id];
    const isConfirm = confirm(
      `Вы уверены, что хотите удалить задачу "${title}"?`
    );
    if (!isConfirm) return isConfirm;
    delete objOfTasks[id];
    return isConfirm;
  }

  function deleteTakFromHtml(confirmed, el) {
    if (!confirmed) return;
    el.remove();
    save();
  }

  function onDeleteHandler({ target }) {
    const listUl = document.querySelector(".list-group");
    if (target.classList.contains("delete-btn")) {
      const parent = target.closest("[data-task-id]");
      const id = parent.dataset.taskId;
      const confirmed = deleteTask(id);
      deleteTakFromHtml(confirmed, parent);
    }
    if (listUl.children.length == 0) {
      emptyListMessage();
      isFirstRemoveEmptyList = true;
    }
  }

  function emptyListMessage() {
    const divContainer = document.createElement("div");
    const divRow = document.createElement("div");
    const divColumn = document.createElement("div");
    const par = document.createElement("p");
    const parent = document.querySelector(".tasks-list-section");

    divContainer.classList.add("container", "mt-3");
    divContainer.setAttribute("id", "emptyListMessage");
    divRow.classList.add("row");
    divColumn.classList.add("col", "col-item", "text-center");

    par.textContent = "Список задач пуст";
    par.style.font = "normal normal bold 2rem arial";
    par.style.color = "red";

    divColumn.appendChild(par);
    divRow.appendChild(divColumn);
    divContainer.appendChild(divRow);

    parent.insertAdjacentElement("afterend", divContainer);
  }

  function removeEmptyListMessage() {
    document.querySelector("#emptyListMessage").remove();
  }

  function onSubmitHandler({ target }) {
    const listUl = document.querySelector(".list-group");
    if (target.classList.contains("complete-btn")) {
      const parent = target.closest("[data-task-id]");
      const id = parent.dataset.taskId;
      if (previousTaskClickedId != id && !objOfTasks[id].completed) {
        objOfTasks[id].completed = true;
        parent.classList.add("completedTask");
      } else if (previousTaskClickedId != id && objOfTasks[id].completed) {
        objOfTasks[id].completed = false;
        parent.classList.remove("completedTask");
      } else if (previousTaskClickedId == id && objOfTasks[id].completed) {
        objOfTasks[id].completed = false;
        parent.classList.remove("completedTask");
      } else {
        objOfTasks[id].completed = true;
        parent.classList.add("completedTask");
      }
      previousTaskClickedId = id;
      if (isClickedNotCompletedTasks) parent.remove();
      save();
    }
  }

  function notCompletedTasksHandler(e) {
    let objOfTasksCopy = { ...objOfTasks };
    let objWithNotCompletedTask = Object.values(objOfTasksCopy).reduce(
      (acc, task) => {
        if (!task.completed) {
          acc[task._id] = task;
        }
        return acc;
      },
      {}
    );
    isClickedNotCompletedTasks = true;
    const list = document.querySelector(".list-group");
    list.innerHTML = "";
    renderAllTasks(objWithNotCompletedTask);
  }

  function onAllTaskButtonClickHandler(e) {
    const list = document.querySelector(".list-group");
    list.innerHTML = "";
    isClickedNotCompletedTasks = false;
    renderAllTasks(objOfTasks);
  }

  function onThemeSelectHandler(e) {
    const selectedTheme = themeSelect.value;
    const isConfirmed = confirm(
      `Вы действительно хотите изменит тему: ${selectedTheme}`
    );
    if (!isConfirmed) {
      themeSelect.value = lastSelectedTheme;
      return;
    }
    setTheme(selectedTheme);
    lastSelectedTheme = selectedTheme;
    localStorage.setItem("app_theme", selectedTheme);
  }

  function setTheme(name) {
    const selctedThemObj = themes[name];
    Object.entries(selctedThemObj).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }

  function save() {
    localStorage.setItem("tasks", JSON.stringify(objOfTasks));
  }

  function get() {
    return JSON.parse(localStorage.getItem("tasks"));
  }
})();
