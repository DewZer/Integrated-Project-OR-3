<script setup>
import { ref, onMounted } from 'vue';
const tableHeader = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider";
const todos = ref([]);
const showModal = ref(false);
const selectedTodo = ref(null);

const editTodo = (todo) => {
  selectedTodo.value = todo;
  showModal.value = true;
};

console.log(todos.value);

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
</script>

<template>
  <div class="overflow-x-auto flex justify-center items-center w-full h-screen">
  <table class="table w-full h-full border-4">
    <!-- head -->
    <thead class="h-20 justify-center items-center">
      <tr class="">
        <th class="text-2xl">Title</th>
        <th class="text-2xl">Assignees</th>
        <th class="text-2xl">Status</th>
        <th class="text-2xl"></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(todo, index) in todos" :key="index" 
      class="itbkk-items hover h-12">
        <td class="itbkk-title text-lg">{{ todo.title }}</td>
        <td class="itbkk-assignees text-lg">{{ todo.assignees }}</td>
        <td class="itbkk-status text-lg">{{ todo.status }}</td>

        <td><button @click="editTodo(todo)" class="btn">Edit</button></td>
      </tr>
    </tbody>
  </table>
</div>


<dialog v-if="showModal" id="my_modal_2" class="modal bg-gray-500 bg-opacity-50" open>
  <div class="modal-box w-3/4 h-3/4 p-6">
    <h2 class="text-2xl font-bold mb-4 text-center">{{ selectedTodo.title }}</h2>
    <div class="p-4 mt-2 border rounded bg-white">
      <p class="text-lg text-gray-700 font-semibold">
        Description:
        <br> {{ selectedTodo.description.split(' ').slice(0, 100).join(' ') }}...
      </p>
    </div>
    <p class="text-md text-white-700 mt-4">
      Assignees: <span class="font-semibold">{{ selectedTodo.assignees }}</span>
    </p>
    <p class="text-md text-white-700mt-2">
      Status: <span class="font-semibold">{{ selectedTodo.status }}</span>
    </p>
    <p class="text-md text-white-700mt-2">
      Created On: <span class="font-semibold">{{ selectedTodo.createdOn }}</span>
    </p>
    <p class="text-md text-white-700 mt-2">
      Updated On: <span class="font-semibold">{{ selectedTodo.updatedOn }}</span>
    </p>
    <div class="modal-action mt-6 flex justify-end">
      <button class="btn bg-blue-500 text-white mr-2" @click="showModal = false">Save</button>
      <button class="btn bg-red-500 text-white" @click="showModal = false">Close</button>
    </div>
  </div>
</dialog>

</template>


<style scoped>
</style>