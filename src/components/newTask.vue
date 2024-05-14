<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { computed } from "vue";

const toast = useToast();

const showAddModal = ref(true);
let errorMessage = ref("");
let newTodo = ref({
  title: "",
  description: "",
  assignees: "",
  status: "No Status",
});

const statuses = ref([]);
const router = useRouter();

const closeModal = () => {
  showAddModal.value = false;
  router.push("/task");
};

// const formatStatus = (status) => {
//   switch (status) {
//     case "NO_STATUS":
//       return "No Status";
//     case "TO_DO":
//       return `To Do`;
//     case "DOING":
//       return `Doing`;
//     case "DONE":
//       return `Done`;
//   }
// };

const fetchStatuses = async () => {
  try {
    // const response = await fetch(`http://localhost:8080/v2/statuses`);
    const response = await fetch(`http://ip23or3.sit.kmutt.ac.th:8080/v2/statuses`);
    if (!response.ok) {
      throw new Error("Failed to fetch statuses");
    }

    const data = await response.json();
    statuses.value = data;
  } catch (error) {
    console.error("Error:", error);
  }
};

const addTodo = async () => {
  newTodo.value.title = newTodo.value.title.trim();
  newTodo.value.description = newTodo.value.description.trim();
  newTodo.value.assignees = newTodo.value.assignees.trim();

  if (!newTodo.value.title) {
    errorMessage.value = "Title is required";
    return;
  }

  const statusObject = statuses.value.find(status => status.name === newTodo.value.status);
  const todo = { ...newTodo.value, status: statusObject ? statusObject.id : null };

  if (!todo.description) {
    delete todo.description;
  }
  if (!todo.assignees) {
    delete todo.assignees;
  }

  try {
    // const response = await fetch("http://localhost:8080/v2/tasks");
    const response = await fetch("http://ip23or3.sit.kmutt.ac.th:8080/v2/tasks");

    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const todos = await response.json();

    let maxId = 0;
    if (todos.length > 0) {
      maxId = Math.max(...todos.map((todo) => todo.id));
    }
    todo.id = maxId + 1;

    // const response2 = await fetch("http://localhost:8080/v2/tasks", {
      const response2 = await fetch("http://ip23or3.sit.kmutt.ac.th:8080/v2/tasks", {

      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(todo),
    });

    if (!response2.ok) {
      throw new Error(`HTTP error! status: ${response2.status}`);
    }

    toast.success("Task added successfully");
    router.push("/task");
  } catch (error) {
    errorMessage.value = error.message;
  }
};
const emit = defineEmits(["task-added"]);

onMounted(async () => {
  await fetchStatuses();
});
</script>

<template>
  <div
    v-if="showAddModal"
    class="fixed z-10 inset-0 overflow-y-auto flex items-center justify-center bg-slate-500"
  >
    <div
      class="bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-70% flex flex-col p-6 overflow-y-auto max-h-screen"
      style="min-width: 50%"
    >
      <div class="bg-grey sm:p-6 sm:pb-4 flex-grow">
        <div class="sm:flex flex">
          <div class="text-center sm:mt-0 sm:ml-4 sm:text-left flex-grow">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              <label for="title" class="label">
                <span class="label-text text-2xl font-bold text-pink-400"
                  >Title</span
                >
              </label>
              <input
                type="text"
                v-model="newTodo.title"
                class="input input-bordered w-full bg-gray-200 rounded-lg text-black mt-2"
                placeholder="Title"
              />
            </h3>

            <div class="mt-2">
              <label for="description" class="label">
                <span class="label-text text-2xl text-green-400 font-bold"
                  >Description</span
                >
              </label>
              <textarea
                v-model="newTodo.description"
                placeholder="Description"
                class="textarea textarea-bordered w-full h-24 rounded-lg textarea-md text-lg bg-gray-200"
              ></textarea>
            </div>

            <div class="mt-2">
              <label for="status" class="label">
                <span class="label-text text-lg font-bold text-yellow-400"
                  >Status</span
                >
              </label>
              <select
                id="status"
                v-model="newTodo.status"
                class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-gray-200"
              >
                <option v-for="status in statuses" :value="status.name">
                  {{ status.name }}
                </option>
              </select>
            </div>

            <div class="mt-2">
              <label for="assignees" class="label">
                <span class="label-text text-xl font-bold text-blue-200"
                  >Assignees</span
                >
              </label>
              <input
                type="text"
                v-model="newTodo.assignees"
                class="input input-bordered w-full bg-gray-200"
                placeholder="Assignees"
              />
            </div>
          </div>
        </div>

        <div
          class="bg-grey-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t mt-3"
        >
          <button
            @click="addTodo"
            type="button"
            class="btn btn-outline btn-success ml-2 sm:ml-4"
            :disabled="!newTodo.title.trim()"
          >
            Save
          </button>
          <button
            @click="closeModal"
            type="button"
            class="btn btn-outline btn-error"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
