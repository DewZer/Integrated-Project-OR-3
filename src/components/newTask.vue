<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";

const toast = useToast();

const showAddModal = ref(true);
let errorMessage = ref("");
const allTodos = ref([]);
let newTodo = ref({
  title: "",
  description: "",
  assignees: "",
  status: "NO_STATUS",
});
const router = useRouter();

const closeModal = () => {
  showAddModal.value = false;
  router.push("/task");
};

const goToTasks = () => {
  router.push("/task");
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
    errorMessage.value = "Title is required";
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
    // const response = await fetch("http://localhost:8080/itb-kk/v1/tasks");
    const response = await fetch("http://ip23or3.sit.kmutt.ac.th:8080/itb-kk/v1/tasks");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const todos = await response.json();

    let maxId = 0;
    if (todos.length > 0) {
      maxId = Math.max(...todos.map((todo) => todo.id));
    }
    todo.id = maxId + 1;

    // const response2 = await fetch("http://localhost:8080/itb-kk/v1/tasks", {
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
    errorMessage.value = "";
    showAddModal.value = false;
    newTodo.value = {
      title: "",
      description: "",
      assignees: "",
      status: "NO_STATUS",
    };
    router.push("/task");
  } catch (error) {
    console.error("Error:", error);
  }
};

const emit = defineEmits(["task-added"]);
</script>

<template>
  <div
    v-if="showAddModal"
    class="fixed z-10 inset-0 overflow-y-auto flex items-center justify-center"
  >
    <div
      class="bg-gray-800 rounded-lg text-white text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-70% flex flex-col"
      style="min-width: 80%; max-width: 100%; height: 80%; overflow: auto"
    >
      <div class="bg-grey sm:p-6 sm:pb-4 flex-grow">
        <div class="sm:flex sm:items-start flex">
          <div class="text-center sm:mt-0 sm:ml-4 sm:text-left flex-grow">
            <!-- Title -->
            <div class="form-control">
              <label class="label">
                <span class="label-text text-white text-xl">Title</span>
              </label>
              <input
                type="text"
                v-model="newTodo.title"
                placeholder="Title"
                class="input input-bordered w-full bg-gray-600 rounded-md gap-2"
              />
            </div>

            <!-- Error message -->
            <p class="text-red-500 text-xs italic" v-if="errorMessage">
              {{ errorMessage }}
            </p>

            <!-- Description  -->
            <div class="form-control mt-4">
              <label class="label">
                <span class="label-text text-white text-xl">Description</span>
                <span class="badge badge-info">Optional</span>
              </label>
              <textarea
                v-model="newTodo.description"
                placeholder="Description"
                class="textarea textarea-bordered h-24 w-full"
              ></textarea>
            </div>

            <!-- Assignees  -->
            <div class="form-control mt-4">
              <label class="label">
                <span class="label-text text-white text-xl">Assignees</span>
                <span class="badge badge-info">Optional</span>
              </label>
              <input
                type="text"
                v-model="newTodo.assignees"
                placeholder="Assignees"
                class="input input-bordered w-full bg-gray-600"
              />
            </div>

            <!-- Status  -->
            <div class="form-control mt-4">
              <label class="label">
                <span class="label-text text-white text-xl">Status</span>
              </label>
              <select
                v-model="newTodo.status"
                class="select select-bordered w-full"
              >
                <option
                  v-for="status in ['NO_STATUS', 'TO_DO', 'DOING', 'DONE']"
                  :value="status"
                >
                  {{ formatStatus(status) }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-grey-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button
          @click="closeModal"
          type="button"
          class="btn btn-outline btn-error btn-lg"
        >
          Close
        </button>
        <button
          @click="addTodo"
          type="button"
          class="btn btn-outline btn-success btn-lg ml-2 sm:ml-4"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</template>
