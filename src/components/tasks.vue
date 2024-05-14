<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
// const url = import.meta.env.BASEURL;

const showDeleteModal = ref(false);
const selectedDeletedTodo = ref(null);
const todos = ref([]);
const router = useRouter();
const deleteButton = ref(null);

const toast = useToast();

const goToEdit = (id) => {
  router.push({ path: `/task/${id}/edit` });
};

const goToView = (id) => {
  router.push({ path: `/task/${id}` });
};
const gotoManageStatus = () => {
  router.push({ path: "/task/status" });
};

const fetchTodos = async () => {
  try {
    const response = await fetch("http://ip23or3.sit.kmutt.ac.th:8080/v2/tasks");
    // const response = await fetch("http://localhost:8080/v2/tasks");

    const data = await response.json();
    todos.value = data.sort((a, b) => a.id - b.id);
    // console.log(todos.value);
  } catch (error) {
    console.error("Error:", error);
  }
};

const truncateTitle = (title) => {
  return title.length > 70 ? title.substring(0, 70) + "..." : title;
};

const deleteTodoById = async (id) => {
  try {
    const response = await fetch(
      // `http://localhost:8080/v2/tasks/${id}`,
      `http://ip23or3.sit.kmutt.ac.th:8080/v2/tasks/${id}`,
      {
        method: "DELETE",
      }
    );

    if (response.ok) {
      toast.success("The task has been deleted");
    } else if (response.status === 404) {
      toast.error("An error has occurred, the task does not exist.");
      setTimeout(() => {
        location.reload();
      }, 1500);
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    showDeleteModal.value = false;
    selectedDeletedTodo.value = null;
    await fetchTodos();
  } catch (error) {
    console.error("Error:", error);
  }
};

const confirmDelete = async () => {
  await deleteTodoById(selectedDeletedTodo.value.id);
  showDeleteModal.value = false;
};
const openDeleteModal = (id) => {
  const todoIndex = todos.value.findIndex((todo) => todo.id === id);
  selectedDeletedTodo.value = {
    ...todos.value[todoIndex],
    count: todoIndex + 1,
  };
  showDeleteModal.value = true;
  nextTick(() => {
    deleteButton.value.focus();
  });
};

const gotoAdd = () => {
  router.push({ path: "/task/add" });
};


onMounted(() => {
  fetchTodos();
});
</script>

<template>
  <div class="w-full flex flex-col items-start h-screen bg-slate-400 overflow-auto">
    <div class="flex justify-center w-full mb-7 relative">
      <span
        class="text-2xl md:text-4xl font-bold mb-3 text-white pt-4 shadow-lg"
      >
        ITBKK-Kradan Kanban
      </span>
      <span
        class="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-green-600 rounded-full"
      ></span>
    </div>

    <div class="w-3/4 mx-auto">
      <table
        class="table-lg style bg-blue-700 text-lg w-full rounded-lg shadow-lg overflow-hidden"
      >
        <thead
          class="text-white w-full bg-gradient-to-r from-pink-300 via-blue-200 to-purple-300"
        >
          <tr>
            <th class="w-1/3 text-center text-gray-800 py-2">Title</th>
            <th class="w-1/4 text-center text-gray-800 py-2">Assignees</th>
            <th class="w-1/4 text-center text-gray-800 py-2">Status</th>
            <th class="1/3 text-center py-2">
              <button
                @click="gotoAdd"
                class="itbkk-button-add btn btn-outline btn-success bg-green-200 btn-md"
              >
                Add Task
              </button>
            </th>
            <th>
              <button
                @click="gotoManageStatus"
                class="itbkk-button-status btn btn-active btn-neutral btn-md hover:bg-blue-500 hover:text-white"
              >
                Manage Status
              </button>
            </th>
          </tr>
        </thead>
        <!-- body -->
        <tbody class="bg-white divide-y divide-gray-200">
          <!-- if no taask -->
          <tr
            v-if="todos.length === 0"
            class="justify-center items-center min-h-screen hover"
          >
            <td
              colspan="5"
              class="px-6 py-4 whitespace-nowrap text-sm text-gray-800 h-20"
            >
              <h2 class="text-lg font-semibold text-gray-700">No tasks yet</h2>
            </td>
          </tr>

          <tr
            v-for="todo in todos"
            :key="todo.id"
            class="itbkk-item hover:bg-gray-100 transition duration-200 ease-in-out transform hover:-translate-y-1 hover:scale-80"
          >
            <td
              class="itbkk-title px-6 py-4 whitespace-nowrap text-sm text-gray-800 cursor-pointer border-b border-gray-200"
              @click="goToView(todo.id)"
            >
              <div
                class="truncate text-lg font-semibold text-blue-600"
                :title="todo.title"
              >
                {{ truncateTitle(todo.title) }}
              </div>
            </td>
            <td
              class="itbkk-assignees px-6 py-4 whitespace-nowrap text-sm text-black-500 italic text-gray-800 border-b border-gray-200 flex items-center justify-center"
            >
              <span class="text-md font-medium text-green-600">
                {{ todo.assignees ? todo.assignees : "Unassigned" }}
              </span>
            </td>
            <td
              class="itbkk-status px-6 py-4 whitespace-nowrap text-sm text-gray-800 border-b border-gray-200"
            >
              <div
                class="rounded-full text-center px-2 py-1"
                :class="
                  todo.status === 'No Status'
                    ? 'bg-gray-200 text-gray-800'
                    : 'bg-blue-200 text-blue-800'
                "
              >
                {{ todo.status }}
              </div>
            </td>

            <td
              class="px-6 py-4 whitespace-nowrap text-sm font-medium text-center"
            >
              <button
                @click="openDeleteModal(todo.id)"
                class="itbkk-button-action bg-red-500 text-white hover:bg-red-700 px-3 py-1 rounded"
              >
                Delete
              </button>
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium"
            >
              <button
                @click="goToEdit(todo.id)"
                class="bg-indigo-500 text-white hover:bg-indigo-700 px-3 py-1 rounded"
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
          <div class="flex flex-col items-center justify-center text-center">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Do you want to delete the task number
              {{ selectedDeletedTodo.count }}
            </h3>
            <h3
              class="text-lg leading-6 font-medium text-gray-900 truncate-title"
            >
              {{ selectedDeletedTodo.title }}
            </h3>
            <h3 class="text-lg leading-6 font-medium text-gray-900">tasks?</h3>
          </div>
        </div>

        <div
          class="bg-gray-50 px-4 py-3 sm:px-6 flex justify-center sm:flex-row-reverse overflow-auto"
        >
          <button
            @click="confirmDelete"
            @keyup.enter="confirmDelete"
            ref="deleteButton"
            type="button"
            class="itbkk-button-delete w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
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
  border-style: solid;
  border-width: 1px;
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

.long-title {
  word-wrap: break-word;
  max-width: 90%;
}

.truncate-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
  display: block;
}
</style>
