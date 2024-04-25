<script setup>
import { ref, onMounted } from 'vue';


const fetchData = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/tasks');
    const data = await response.json();
    todos.value = data;
  } catch (error) {
    console.error('Error:', error);
  }
};

onMounted(fetchData);
const tableHeader = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider";
const todos = ref([]);
const showModal = ref(false);
const selectedTodo = ref(null);


const editTodo = (todo) => {
  selectedTodo.value = todo;
  showModal.value = true;
};

console.log(todos.value);

const formatStatus = (status) => {
  switch (status) {
    case 'NO_STATUS':
      return 'No Status';
    case 'TODO':
      return 'To Do';
    case 'DOING':
      return 'Doing';
    case 'DONE':
      return 'Done';
    default:
      return status;
  }
};

const formatDate = (date) => {
  const dt = new Date(date);
  const day = String(dt.getDate()).padStart(2, '0');
  const month = String(dt.getMonth() + 1).padStart(2, '0'); // January is 0!
  const year = dt.getFullYear();
  const hours = String(dt.getHours()).padStart(2, '0');
  const minutes = String(dt.getMinutes()).padStart(2, '0');
  const seconds = String(dt.getSeconds()).padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};
</script>

<template>
  <div class="flex min-w-full min-h-screen m-0 p-0">
    <table v-if="todos.length"
      class="table-auto w-full h-full border-4 bg-white shadow-md rounded-lg overflow-hidden mx-auto">
      <!-- head -->
      <thead class="bg-blue-500 text-white">
        <tr>
          <th class="px-4 py-2 text-xl">Title</th>
          <th class="px-4 py-2 text-xl">Assignees</th>
          <th class="px-4 py-2 text-xl w-1/3">Status</th>
          <th class="px-4 py-2 text-xl"></th>
        </tr>
      </thead>
      <!-- body -->
      <tbody>
        <tr v-for="(todo, index) in todos" :key="index" class="itbkk-item hover:bg-gray-100 h-12">
          <td class="border px-4 py-2 itbkk-title text-lg">{{ todo.title }}</td>
          <td class="border px-4 py-2 itbkk-assignees text-lg italic">{{ todo.assignees ? todo.assignees : 'Unassigned'
            }}</td>
          <td class="border px-4 py-2 itbkk-status text-lg w-1/3">{{ formatStatus(todo.status) }}</td>
          <td class="border px-4 py-2"><button @click="editTodo(todo)"
              class="btn bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Edit</button></td>
        </tr>
      </tbody>
    </table>

    <div v-else class="flex justify-center items-center w-full h-full">
      <h2 class="text-2xl">No tasks available</h2>
    </div>
  </div>

  <!-- modal  -->
  <dialog v-if="showModal" id="my_modal_2" class="modal bg-gray-500 bg-opacity-50" open>
    <div class="modal-box w-3/4 h-3/4 p-6">
      <h2 class="itbkk-title text-2xl font-bold mb-4 text-center overflow-wrap break-word word-break break-all">
        {{ selectedTodo.title }}
      </h2>

      <div class="p-4 mt-2 border rounded bg-white overflow-auto h-2/4">
        <p class="itbkk-description text-lg text-gray-700 font-semibold overflow-wrap break-word word-break break-all">
          Description:
          <br> {{ selectedTodo.description }}...
        </p>
      </div>

      <p class="itbkk-assignees text-md text-white-700 mt-4">
        Assignees: <span class="font-semibold">{{ selectedTodo.assignees ? selectedTodo.assignees : 'Unassigned'
            }}</span>
      </p>
      <p class="itbkk-status text-md text-white-700mt-2">
        Status: <span class="font-semibold">{{ formatStatus(selectedTodo.status) }}</span>
      </p>
      <p class="itbkk-created-on text-md text-white-700mt-2">
        Created On: <span class="font-semibold">{{ formatDate(selectedTodo.createdOn) }}</span>
      </p>
      <p class="itbkk-updated-on text-md text-white-700 mt-2">
        Updated On: <span class="font-semibold">{{ formatDate(selectedTodo.updatedOn) }}</span>
      </p>
      <div class="modal-action mt-6 flex justify-end">
        <button class="btn bg-blue-500 text-white mr-2" @click="showModal = false">Save</button>
        <button class="btn bg-red-500 text-white" @click="showModal = false">Close</button>
      </div>
    </div>
  </dialog>

</template>


<style scoped></style>