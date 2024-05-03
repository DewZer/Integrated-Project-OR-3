<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";

const showDeleteModal = ref(false);
const selectedDeletedTodo = ref(null);
const todos = ref([]);
const router = useRouter();
const deleteButton = ref(null);

const toast = useToast();

const goToEdit = (id) => {
  router.push({ path: `/task/${id}` });
};

const fetchTodos = async () => {
  try {
    const response = await fetch("http://ip23or3.sit.kmutt.ac.th:8080/itb-kk/v1/tasks");
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
    const response = await fetch(
      `http://ip23or3.sit.kmutt.ac.th:8080/itb-kk/v1/tasks/${id}`,
      {
        method: "DELETE",
      }
    );

    if (response.ok) {
      toast.success("The task has been deleted");
    } else if (response.status === 404) {
      toast.error("An error has occurred, the task does not exist.");
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    showDeleteModal.value = false;
    selectedDeletedTodo.value = null;
    await fetchTodos(); // Add await here
  } catch (error) {
    console.error("Error:", error);
  }
};

const confirmDelete = async () => {
  await deleteTodoById(selectedDeletedTodo.value.id);
  showDeleteModal.value = false;
};
const openDeleteModal = (id) => {
  selectedDeletedTodo.value = todos.value.find((todo) => todo.id === id);
  showDeleteModal.value = true;
  nextTick(() => {
    deleteButton.value.focus();
  });
};

const gotoAdd = () => {
  router.push({ path: "/task/add" });
};

const formatStatus = (status) => {
  switch (status) {
    case "NO_STATUS":
      return "No Status";
    case "TO_DO":
      return `To Do`;
    case "DOING":
      return `Doing`;
    case "DONE":
      return `Done`;
  }
};

onMounted(() => {
  fetchTodos();
});
</script>

<template>
  <div class="container mx-auto pt-4 px-4 py-16">
    <!-- Header -->
    <div class="flex justify-center w-full mb-7 relative">
      <span class="text-2xl md:text-3xl font-bold mb-3">
        ITBKK-Kradan Kanban
      </span>
      <span
        class="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-green-600 rounded-full"
      ></span>
    </div>

    <div>
      <table class="table-lg style bg-gray-700 dark:bg-gray-700 text-lg w-full">
        <thead class="bg-gray-200 w-full">
          <tr>
            <th class="w-1/3 text-black">Title</th>
            <th class="w-1/4 text-black">Assignees</th>
            <th class="w-1/4 text-black">Status</th>
            <th class="1/3">
              <button
                @click="gotoAdd"
                class="btn btn-outline btn-success bg-green-200 btn-lg"
              >
                Add Task
              </button>
            </th>
            <th></th>
          </tr>
        </thead>
        <!-- body -->
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-if="todos.length === 0"
            class="flex justify-center items-center min-h-screen hover"
          >
            <td
              colspan="5"
              class="1/3 px-6 py-4 whitespace-nowrap text-sm text-gray-800"
            >
              No task
            </td>
          </tr>
          <tr
            v-for="todo in todos"
            :key="todo.id"
            class="itbkk-item hover:bg-gray-100 transition duration-200 ease-in-out transform hover:-translate-y-1 hover:scale-80"
          >
            <td
              class="itbkk-title px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer"
              @click="goToEdit(todo.id)"
            >
              <div class="truncate text-md font-bold" :title="todo.title">
                {{ todo.title }}
              </div>
            </td>
            <td
              class="itbkk-assignees px-6 py-4 whitespace-nowrap text-sm text-black-500 italic"
            >
              {{ todo.assignees ? todo.assignees : "Unassigned" }}
            </td>
            <td
              class="itbkk-status px-6 py-4 whitespace-nowrap text-sm text-gray-500"
            >
              <div
                class="rounded-full text-center"
                :class="`status-${todo.status
                  .toLowerCase()
                  .replace(/[\s_]+/g, '-')}`"
                style="padding: 8px; width: 100px; margin: auto"
              >
                {{ formatStatus(todo.status) }}
              </div>
            </td>

            <td
              class="px-6 py-4 whitespace-nowrap text-sm font-medium text-center"
            >
              <button
                @click="openDeleteModal(todo.id)"
                class="text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
            >
              <button
                @click="goToEdit(todo.id)"
                class="text-indigo-600 hover:text-indigo-900"
              >
                Edit
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- delete modal -->
    <div
      v-if="showDeleteModal"
      class="fixed z-10 inset-0 overflow-y-auto flex items-center justify-center bg-slate-500 bg-opacity-25"
    >
      <div
        class="bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full"
      >
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Are you sure you want to delete this task?
              </h3>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            @click="confirmDelete"
            @keyup="confirmDelete"
            ref="deleteButton"
            type="button"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Delete
          </button>
          <button
            @click="showDeleteModal = false"
            type="button"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.status-no-status,
.status-to-do,
.status-doing,
.status-done {
  border-style: solid; /* This makes the border visible */
  border-width: 1px; /* Adjust the width as needed */
}

.status-no-status {
  border-color: blue;
  color: blue;
}

.status-to-do {
  border-color: gray;
  color: gray;
}
.status-doing {
  border-color: orange;
  color: orange;
}

.status-done {
  border-color: green;
  color: green;
}
</style>
