const EditIcon =
  '<svg focusable = "false" fill = "#f0f0f0" width="20px" height="20px" aria-hidden="true" viewBox = "0 0 24 24"  aria - label="fontSize small" > <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg >';
const DeleteIcon = `<svg focusable="false" fill = "#f0f0f0" width="20px" height="20px" aria-hidden="true" viewBox="0 0 24 24" aria-label="fontSize small"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>`;
const ArrowLeftIcon = `<svg focusable = "false" fill = "#f0f0f0" width="20px" height="20px" aria-hidden="true" viewBox = "0 0 24 24" aria - label="fontSize small" > <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path></svg >`;
const ArrowRightIcon = `<svg focusable = "false" fill = "#f0f0f0" width="20px" height="20px" aria-hidden="true" viewBox = "0 0 24 24" data - testid="ArrowForwardIcon" aria - label="fontSize small" > <path d="m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"></path></svg >`;

const API = (() => {
  const URL = "http://localhost:3000/todos";

  const getTodos = () => {
    return fetch(URL).then((res) => res.json());
  };

  const addTodo = (newTodo) => {
    return fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTodo),
    }).then((res) => res.json());
  };

  const deleteTodo = (id) => {
    return fetch(URL + `/${id}`, {
      method: "DELETE",
    }).then((res) => res.json());
  };

  const updateTodo = (id, updateTodo) => {
    return fetch(URL + `/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updateTodo),
      headers: { "Content-Type": "application/json" },
    }).then((res) => res.json());
  };

  return {
    getTodos,
    addTodo,
    deleteTodo,
    updateTodo,
  };
})();

const Model = (function () {
  class State {
    #onChange;
    #todos;

    constructor() {
      this.#todos = [];
    }

    get todos() {
      return this.#todos;
    }

    set todos(todos) {
      this.#todos = todos;
      this.#onChange?.();
    }

    subscribe(callback) {
      this.#onChange = callback;
    }
  }

  const { getTodos, addTodo, deleteTodo, updateTodo } = API;

  return {
    State,
    getTodos,
    addTodo,
    deleteTodo,
    updateTodo,
  };
})();

const View = (function () {
  // const
  const formEl = document.querySelector(".form");
  const mainEl = document.querySelector(".main");
  const todoListEl = document.querySelector(".incomplete");
  const todoListCompeleteEl = document.querySelector(".complete");
  const inputEl = document.querySelector("#input");

  const renderTodos = (todos) => {
    let tempIncomp = "";
    let tempComp = "";

    todos.forEach((todo) => {
      let tempOne = `
            <li>
                <span>${todo.name}</span>
                <input type="text" class="edit-input"/>
                <button class="btn-delete" id="${todo.id}">${DeleteIcon}</button>
                <button class="btn-edit" id="${todo.id}">${EditIcon}</button>
                <button class="btn-change" id="${todo.id}">${ArrowRightIcon}</button>
            </li>
            `;

      let tempTwo = `
            <li>
                <button class="btn-change" id="${todo.id}">${ArrowLeftIcon}</button>
                <span>${todo.name}</span>
                <input type="text" class="edit-input"/>
                <button class="btn-delete" id="${todo.id}">${DeleteIcon}</button>
                <button class="btn-edit" id="${todo.id}">${EditIcon}</button>
            </li>
            `;

      !todo.isCompleted ? (tempIncomp += tempOne) : (tempComp += tempTwo);
    });

    todoListEl.innerHTML = tempIncomp;
    todoListCompeleteEl.innerHTML = tempComp;
  };

  return {
    formEl,
    inputEl,
    todoListEl,
    mainEl,
    renderTodos,
  };
})();

const ViewModel = (function (View, Model) {
  const state = new Model.State();

  const getTodos = function () {
    Model.getTodos().then((data) => {
      state.todos = data.reverse();
    });
  };

  const addTodo = function (event) {
    event.preventDefault();
    const title = View.inputEl.value;

    if (title.trim() === "") {
      alert("Please input title");
      return;
    }

    Model.addTodo({ name: title, isCompleted: false })
      .then((data) => {
        state.todos = [data, ...state.todos];
        View.inputEl.value = "";
      })
      .catch((err) => {
        alert(err);
      });
  };

  const deleteTodo = (event) => {
    const id = Number(event.target.id);

    Model.deleteTodo(id)
      .then((data) => {
        let filtered = state.todos.filter((todo) => {
          return todo.id !== id;
        });

        state.todos = filtered;
      })
      .catch((err) => alert(err));
  };

  const init = () => {
    getTodos();
    View.formEl.addEventListener("submit", addTodo);
    View.mainEl.addEventListener("click", (event) => {
      if (event.target.className === "btn-delete") {
        deleteTodo(event);
      }
    });

    state.subscribe(() => {
      View.renderTodos(state.todos);
    });
  };

  return { init };
})(View, Model);

ViewModel.init();
