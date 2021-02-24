import { Navbar } from './Navbar.js';
import { About } from './About.js';

const location = window.location;
console.log(location);

const router = ({ location }) => {
  console.log(location.pathname);
  const route = '/about';
  if (location.pathname === `${route}`) {
    About();
  }
};

window.addEventListener('load', (e) => {
  setTimeout(() => {
    console.log('Hiyyyaaaaa');
  }, 3000);
});

const random = () => Math.random();

const TODO_LIST = document.createElement('ul');
TODO_LIST.style.padding = '0 0 2rem 0';
TODO_LIST.style.width = '80%';
TODO_LIST.style.margin = 'auto';
TODO_LIST.style.listStyle = 'none';

const state = {
  todos: []
};

const main = () => {
  const TodoButton = () => {
    const todoButton = document.createElement('button');
    todoButton.innerHTML = 'add';
    return {
      todoButton
    };
  };

  const TodoInput = () => {
    const todoInput = document.createElement('input');
    function addDeleteHandler(e) {
      const list = document.getElementsByTagName('ul');
      list[0].removeChild(e.target.parentNode);
    }
    function onSubmit(e) {
      const { item } = TodoItem(e.target.value);
      item.style.paddingTop = '1rem';
      const deleteIcon = document.createElement('button');
      deleteIcon.style.display = 'inline-block';
      deleteIcon.style.float = 'right';
      deleteIcon.innerHTML = 'X';
      deleteIcon.addEventListener('click', addDeleteHandler);
      TODO_LIST.appendChild(item);
      item.insertAdjacentElement('beforeend', deleteIcon);
      e.target.value = '';
    }
    todoInput.addEventListener('change', onSubmit, false);
    return {
      todoInput
    };
  };

  const TodoForm = () => {
    const form = document.createElement('form');
    form.addEventListener('submit', function (e) {
      e && e.preventDefault();
    });
    return {
      form
    };
  };

  const TodoApp = () => {
    const { todoButton } = TodoButton();
    const { form } = TodoForm();
    const { todoInput } = TodoInput();
    const { nav } = Navbar();
    const body = document.body;
    // body.style.marginTop = '4rem';
    body.style.margin = 0;
    body.style.boxSizing = 'border-box';
    body.style.textAlign = 'center';
    const container = document.createElement('div');
    // container.style.display = 'flex';
    container.style.width = '70%';
    container.style.margin = 'auto';
    const title = document.createElement('h2');
    title.textContent = 'Todo App';
    body.appendChild(nav);
    container.appendChild(title);
    form.appendChild(todoInput);
    form.appendChild(todoButton);
    container.appendChild(form);
    container.appendChild(TODO_LIST);
    body.appendChild(container);
  };

  TodoApp();
};

// main();
router(window);
