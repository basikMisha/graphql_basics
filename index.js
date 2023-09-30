const url = 'https://graphqlzero.almansi.me/api';

const addForm = document.forms.addtask;
const searchForm = document.forms.findtask;

const todos = document.getElementById('todos');

addForm.addEventListener('submit', addTodo);
searchForm.addEventListener('submit', findTodos);

const makeRequest = (query) => {
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: query })
    }).then(res => res.json())
}

function printTodo({ title, completed = false, id = "", user = {} }) {
    const li = document.createElement('li');
    li.className = "list-group-item";
    li.innerHTML = `&nbsp; ${title} | ID: ${id} | by <b>${user.name}</b>`;
    li.setAttribute("data-id", id);

    const checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    if (completed) {
        checkbox.setAttribute("checked", "true");
    }
    checkbox.addEventListener("change", handleTodoStatus);
    li.prepend(checkbox);

    const delBtn = document.createElement("button");
    delBtn.className = "btn btn-link mb-1";
    delBtn.innerHTML = "&times;";
    delBtn.addEventListener('click', deleteTodo);
    li.append(delBtn);
    todos.append(li);
}

makeRequest(`query Todos {
    todos {
      data {
        id
        title
        completed
        user {
          name
        }
      }
    }
  }`).then(({ data }) => data.todos.data.forEach((todo) => printTodo(todo)));

async function addTodo(e) {
    e.preventDefault();

    if (addForm.taskname.value) {
        const newTask = `mutation CreateTodo {
            createTodo(input: {title: "${addForm.taskname.value}", completed: false}) {
                title
                completed
                id
            }
          }`;

        const data = await makeRequest(newTask);
        printTodo(data.data.createTodo);
        addForm.reset();
    }
}

async function findTodos(e) {
    e.preventDefault();
    const searchText = searchForm.searchname.value;
    if(searchText) {
        const searchQuery = `query SearchQuery {
            todos(options: {search: {q: "${searchText}"}, sort: {field: "id", order: DESC}}) {
              data {
                id
                title
                completed
                user {
                    name
                }
              }
            }
          }`;
        const {data} = await makeRequest(searchQuery);
        todos.innerHTML = "";
        data.todos.data.forEach((todo) => printTodo(todo))
    }
}

async function handleTodoStatus() {
  const todoId = this.parentElement.dataset.id;
 
  const changeStatusQuery = `mutation ChangeStatus {
    updateTodo(id: "${todoId}", input: {completed: ${this.checked}}) {
      completed
    }
  }`;

  const data = await makeRequest(changeStatusQuery);
  if(data.data.updateTodo.completed) {
    this.setAttribute("checked", "true");
  } else {
    this.removeAttribute("checked");
  }
}

async function deleteTodo() {
  const todoId = this.parentElement.dataset.id;
  const deleteTodoQuery = `mutation DeleteTodo {
    deleteTodo(id: "${todoId}") }`;

  const data = await makeRequest(deleteTodoQuery);
  if(data) {
    this.parentElement.remove();
  }
}