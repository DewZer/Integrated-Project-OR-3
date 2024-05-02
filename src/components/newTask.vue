<script setup>
import { ref } from "vue";
import { useRouter } from 'vue-router';
import { useToast } from "vue-toastification";

const toast = useToast();


const showAddModal = ref(true);
let errorMessage = ref('');
const allTodos = ref([]);
let newTodo = ref({
  title: '',
  description: '',
  assignees: '',
  status: 'NO_STATUS'
});
const router = useRouter();

const closeModal = () => {
  showAddModal.value = false;
  router.push('/task');
};

const goToTasks = () => {
  router.push('/task');
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



const addTodo = async () => {
  if (!newTodo.value.title.trim()) {
    errorMessage.value = 'Title is required';
    return;
  }
  const todo = { ...newTodo.value };
  if (!todo.description) {
    delete todo.description;
  }
  if (!todo.assignees) {
    delete todo.assignees;
  }

  try {
    const response = await fetch("http://ip23or3.sit.kmutt.ac.th:8080/itb-kk/v1/tasks");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const todos = await response.json();

    let maxId =0
    if (todos.length > 0) {
      maxId = Math.max(...todos.map(todo => todo.id));
    }
    todo.id = maxId + 1;

    const response2 = await fetch("http://ip23or3.sit.kmutt.ac.th:8080/itb-kk/v1/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todo),
  });
  if (response2.status === 200) {
    toast.success("Task added successfully");
  } else {
    throw new Error(`HTTP error! status: ${response2.status}`);


  }

    const data = await response2.json();
    allTodos.value.push(data);
    errorMessage.value = '';
    showAddModal.value = false;
    newTodo.value = {
      title: '',
      description: '',
      assignees: '',
      status: 'NO_STATUS',
    };
    router.push('/task');
  } catch (error) {
    console.error("Error:", error);
  }
};

const emit = defineEmits(['task-added']);


</script>

<template>
     <div v-if="showAddModal" class="fixed z-10 inset-0 overflow-y-auto flex items-center justify-center">
    <div class="bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-4xl sm:w-full bg-opacity-50">
        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 class="text-lg leading-6 font-medium text-gray-900">
                        <input type="text" v-model="newTodo.title" class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" placeholder="Title">
                    </h3>
                    <p class="text-red-500 text-xs italic" v-if="errorMessage">{{ errorMessage }}</p>
                    <div class="mt-2">
                        <textarea v-model="newTodo.description" class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md h-32" placeholder="Description">
                        </textarea>
                    </div>
                    <div class="mt-2">
                        <label for="assignees" class="block text-sm font-medium text-gray-700">Assignees</label>
                        <input type="text" v-model="newTodo.assignees" class="mt-1 block"
                        </div>

                    <div class="mt-2">
                        <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
                        <select id="status" v-model="newTodo.status" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                            <option v-for="status in ['NO_STATUS', 'TO_DO', 'DOING', 'DONE']" :value="status">{{ formatStatus(status) }}</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button @click="addTodo"
            type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                Save
            </button>
            <button @click="goToTasks"
            type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm">
                Close 
            </button>
        </div>
    </div>
</div>
</template>

