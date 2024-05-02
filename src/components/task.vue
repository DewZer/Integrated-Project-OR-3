<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useRouter } from 'vue-router';
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
    const response = await fetch("http://localhost:8080/itb-kk/v1/tasks");
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
    const response = await fetch(`http://localhost:8080/itb-kk/v1/tasks/${id}`, {
      method: "DELETE",
    });
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
  selectedDeletedTodo.value = todos.value.find(todo => todo.id === id);
  showDeleteModal.value = true;
  nextTick(() => {
    deleteButton.value.focus();
  });
};

const gotoAdd = () => {
  router.push({ path: '/task/add' });
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
  
  <div class="container mx-auto">
    <table class="min-w-full divide-y divide-gray-200 shadow-md rounded-lg overflow-hidden mx-auto bg-white">
      <!-- head -->
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Title
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Assignees
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            <button @click="gotoAdd"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Add Todo
            </button>
          </th>
        </tr>
      </thead>
    
      <tbody class="bg-white divide-y divide-gray-200">
        <!-- body -->
        <tr v-if="todos.length === 0">
          <td colspan="5" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            No task
          </td>
        </tr>
        <tr 
          v-for="todo in todos"
          :key="todo.id"
          class="itbkk-item hover:bg-gray-100 transition duration-200 ease-in-out transform hover:-translate-y-1 hover:scale-110"
        >
        <td class="itbkk-title px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer" @click="goToEdit(todo.id)">
    {{ todo.title }}
  </td>
          <td class="itbkk-assignees px-6 py-4 whitespace-nowrap text-sm text-gray-500 italic">
            {{ todo.assignees ? todo.assignees : "Unassigned" }}
          </td>
          <td class="itbkk-status px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {{ formatStatus(todo.status) }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button
            @click="openDeleteModal(todo.id)"
              class="text-red-600 hover:text-red-900"
            >
              Delete
            </button>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
    <button @click="goToEdit(todo.id)" class="text-indigo-600 hover:text-indigo-900">Edit</button>
  </td>
        </tr>
      </tbody>
    </table>
    

    <!-- delete modal -->
    <div v-if="showDeleteModal" class="fixed z-10 inset-0 overflow-y-auto flex items-center justify-center">
    <div class="bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
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
        <button @click="confirmDelete" @keyup="confirmDelete" ref="deleteButton"
        type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
          Delete
        </button>
        <button @click="showDeleteModal = false"
        type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm">
          Cancel 
        </button>
      </div>
    </div>
  </div>
  </div>




</template>
