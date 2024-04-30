<script setup>
import { ref, onMounted, computed } from "vue";

import { nextTick } from 'vue';
import autosize from "autosize";

const descriptionTextarea = ref(null);
const showDeleteModal = ref(false);
const selectedDeletedTodo = ref(null);
const todos = ref([]);
let showEditModal = ref(false);
const selectedTodo = ref(null);
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const fetchTodos = async () => {
  try {
    const response = await fetch("http://localhost:8080/it-bkk/v1/tasks");
    const data = await response.json();
    todos.value = data.sort(
      (a, b) => new Date(b.createdOn) - new Date(a.createdOn)
    );
  } catch (error) {
    console.error("Error:", error);
  }
};

const deleteTodoById = async (id) => {
  try {
    const response = await fetch(`http://localhost:8080/it-bkk/v1/tasks/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    showDeleteModal.value = false;
    selectedDeletedTodo.value = null;
    await fetchTodos(); // Add await here
  } catch (error) {
    console.error("Error:", error);
  }
};

const fetchDataById = async (id) => {
  try {
    const response = await fetch(`http://localhost:8080/it-bkk/v1/tasks/${id}`);
    const selectedData = await response.json();
    selectedTodo.value = selectedData;
  } catch (error) {
    console.error("Error:", error);
  }
};

const addTodo = async (newTodo, todos) => {
  newTodo.id = todos.length + 1;
  newTodo.createdOn = new Date().toISOString().slice(0, 19).replace("T", " ");
  newTodo.updatedOn = new Date().toISOString().slice(0, 19).replace("T", " ");
  try {
    const response = await fetch("http://localhost:8080/it-bkk/v1/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTodo),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    todos.push(data);
  } catch (error) {
    console.error("Error:", error);
  }
  return todos;
};

const tableHeader =
  "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider";


const editTodo = async (todo) => {
  await fetchDataById(todo.id);
  showEditModal.value = true;
  nextTick(() => {
    openModal();
  });
};

const confirmDelete = (todo) => {
  selectedDeletedTodo.value = todo;
  showDeleteModal.value = true;
};

const options = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "UTC",
};

const formatDate = (date) => {
  console.log('Original date:', date);
  const formattedDate = new Date(date).toLocaleDateString("en-GB", options);
  console.log('Formatted date:', formattedDate);
  return formattedDate;
};

const formatStatus = (status) => {
  switch (status) {
    case "NO_STATUS":
      return "No Status";
    case "TODO":
      return `To Do`;
    case "DOING":
      return `Doing`;
    case "DONE":
      return `Done`;
  }
};

const openModal = () => {
  const modal = document.getElementById('my_modal_1');
  if (modal) {
    modal.showModal();
  } else {
    console.error('Modal with id "my_modal_1" not found');
  }
};

// dont touch this
onMounted(() => {
  fetchTodos();
  autosize(descriptionTextarea.value);
});
</script>

<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen w-screen bg-gradient-to-r text-white"
  >
    <h1 class="text-2xl font-bold text-center text-white mb-8">
      IT-BKK Kradan Kanban
    </h1>
    <table
      class="table-auto mx-auto my-auto text-center bg-gray-800 text-white rounded-lg overflow-hidden"
    >
      <!-- head -->
      <thead class="bg-gray-700">
        <tr>
          <th class="w-1/5">Title</th>
          <th class="w-1/5">Assignees</th>
          <th class="w-1/5">Status</th>
          <th class="w-1/5">
            <button
              @click="
                addTodo(
                  {
                    title: 'New Todo',
                    assignees: 'John Doe',
                    status: 'NO_STATUS',
                  },
                  todos
                )
              "
              class="btn btn-outline btn-primary bg-green-500 text-white py-2 px-4 rounded"
            >
              Add Todo
            </button>
          </th>
        </tr>
      </thead>

      <tbody>
        <!-- body -->
        <tr v-if="todos.length === 0">
          <td colspan="5" class="text-center py-4">No task</td>
        </tr>
        <tr
          v-for="todo in todos"
          :key="todo.id"
          class="itbkk-item border-gray-600 hover:bg-gray-700 hover:shadow-lg transition duration-200 ease-in-out transform hover:-translate-y-1 hover:scale-110"
        >
          <td 
             class="itbkk-title btn" @click="editTodo(todo)">{{ todo.title }}>
          </td>
          <td class="itbkk-assignees py-2 w-1/5 italic">
            {{ todo.assignees ? todo.assignees : "Unassigned" }}
          </td>
          <td class="itbkk-status py-2 w-1/5">
            {{ formatStatus(todo.status) }}
          </td>
          <td class="py-2 w-1/5">
            <button
              @click="confirmDelete(todo)"
              class="btn btn-outline btn-danger bg-red-500 text-white py-2 px-4 rounded"
              onclick="my_modal_5.showModal()"
            >
              Delete
            </button>
          </td>
          <td>
            <button class="btn" @click="editTodo(todo);openModal()">edit</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- edit modal -->

    <dialog v-if="showEditModal" id="my_modal_1" class="modal">
      <div
        class="modal-box w-[500px] h-[200px] p-6 bg-blue-900 rounded shadow-lg"
      >
        <h3
          class="itbkk-title font-bold text-2xl mb-4 p-4 rounded text-center text-white bg-gray-800"
          style="overflow-wrap: break-word"
        >
          {{ selectedTodo.title }}
        </h3>
        <h2 class="text-xl mb-2">Description</h2>
        <textarea
          ref="descriptionTextarea"
          class="itbkk-description py-20 p-4 rounded mb-4 text-lg bg-gray-800 w-full max-h-[500px] italic"
        
          >{{ selectedTodo.description ? selectedTodo.description : 'No Description Provided' }} 
          </textarea>

        <p
          class="itbkk-assignees py-2 p-4 bg-gray-800 rounded mb-4 text-lg"
          style="overflow-wrap: break-word"
        >
          Assignees:
          {{ selectedTodo.assignees ? selectedTodo.assignees : "Unassigned" }}
        </p>
        <p
          class="itbkk-status py-2 p-4 bg-gray-800 rounded mb-4 text-lg"
          style="overflow-wrap: break-word"
        >
          Status: <select v-model="selectedTodo.status" class="itbkk-status py-2 p-4 bg-gray-800 rounded mb-4 text-lg">
  <option value="NO_STATUS">No Status</option>
  <option value="TODO">To Do</option>
  <option value="DOING">Doing</option>
  <option value="DONE">Done</option>
</select>
        </p>
        <p
          class="itbkk-timezone py-2 p-4 bg-gray-800 rounded mb-4 text-lg"
          style="overflow-wrap: break-word"
        >
          Timezone: {{ timezone }}
        </p>
        <p
          class="itbkk-created-on py-2 p-4 bg-gray-800 rounded mb-4 text-lg"
          style="overflow-wrap: break-word"
        >
          Created On: {{ formatDate(selectedTodo.createdOn) }}
        </p>
        <p
          class="itbkk-updated-on py-2 p-4 bg-gray-800 rounded mb-4 text-lg"
          style="overflow-wrap: break-word"
        >
          Updated On: {{ formatDate(selectedTodo.updatedOn) }}
        </p>
        <div class="modal-action mt-6">
          <form method="dialog">
            <button class="btn bg-blue-500 text-white py-2 px-4 rounded">
              Close
            </button>
            <button class="btn bg-green-500 text-white py-2 px-4 rounded ml-4">
              Save
            </button>
          </form>
        </div>
      </div>
    </dialog>

    <!-- delete modal -->
    <dialog v-if="showDeleteModal" id="my_modal_5" class="modal">
      <div class="bg-blue-500">
        <h3>Are you sure you want to delete this task?</h3>
        <button
          @click="deleteTodoById(selectedDeletedTodo.id)"
          class="btn btn-outline btn-danger bg-red-500 text-white py-2 px-4 rounded"
        >
          Delete
        </button>
        <button
          @click="showDeleteModal = false"
          class="btn btn-outline btn-primary bg-blue-500 text-white py-2 px-4 rounded"
        >
          Cancel
        </button>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.table-auto {
  border: 1px solid #ddd;
  /* Thin border for the table */
  border-collapse: collapse;
  /* Remove gaps between cells */
  border-radius: 5px;
  /* Rounded corners */
}

.table-auto th {
  padding: 10px 15px;
  /* Increased padding for headers */
  font-weight: bold;
  /* Bold font for headers */
  border: 1px solid #ddd;
  /* Thin border for headers */
}

.table-auto tr:nth-child(even) {
}

.table-auto tr:hover {
  cursor: pointer;
  /* Pointer cursor on hover for clickable rows */
}

.table-auto td {
  padding: 10px 15px;
  /* Increased padding for cells */
  border: 1px solid #ddd;
  /* Thin border for cells */
}

.table-auto th:nth-child(4),
/* target 4th child (Status) */
.table-auto td:nth-child(4),
.table-auto th:nth-child(5),
/* target 4th child (Status) */
.table-auto td:nth-child(5) {
  width: 50%;
  /* Set width to 30% of the table */
}
</style>
