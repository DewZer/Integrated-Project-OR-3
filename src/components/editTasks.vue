<script setup>
import { ref, onMounted, nextTick } from "vue";
import { watch } from "vue";
import { useRoute, useRouter } from "vue-router";
const selectedTodo = ref(null);
const showEditModal = ref(false);
const route = useRoute();
const router = useRouter(); // add this line
let errorMessage = ref("");
let assigneesText = ref('');

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const fetchDataById = async (id) => {
  try {
    const response = await fetch(`http://localhost:8080/itb-kk/v1/tasks/${id}`);
    if (!response.ok) {
      // if the response status is not ok (e.g., 404 Not Found)
      throw new Error("No task found with this ID");
    }
    const data = await response.json();
    selectedTodo.value = data;
    assigneesText.value = data.assignees;
    console.log(selectedTodo.value);
    showEditModal.value = true; // set showEditModal to true after fetching the data
  } catch (error) {
    console.error("Error:", error);
    alert("No task found with this ID");
    router.push({ path: "/tasks" });
  }
};

const closeModalWithEdit = async () => {
  if (!selectedTodo.value.title.trim()) {
    errorMessage.value = "Title is required";
    return;
  }

  // Create a copy of selectedTodo.value
  const todoToUpdate = { ...selectedTodo.value };

  // Update assignees
  todoToUpdate.assignees = assigneesText.value;

  // If assignees is null or an empty string, delete it from the copy
  if (!todoToUpdate.assignees || !todoToUpdate.assignees.trim()) {
    delete todoToUpdate.assignees;
  }

  try {
    const response = await fetch(
      `http://localhost:8080/itb-kk/v1/tasks/${todoToUpdate.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(todoToUpdate),
        
      },
      router.push({ path: "/tasks" })
    );
    // ...
  } catch (error) {
    console.error("Error:", error);
  }
};

const openModal = () => {
  nextTick(() => {
    const dialog = document.getElementById("my_modal_1");
    if (dialog) {
      dialog.showModal();
    }
  });
};

const getTimeZone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

watch(showEditModal, (newVal) => {
  if (newVal) {
    openModal();
  }
});

const closeModal = () => {
  showEditModal.value = false;
  router.push({ path: "/tasks" });
};

const formatDate = (date) => {
  const formattedDate = new Date(date).toLocaleDateString("en-GB", options);
  return formattedDate;
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

const options = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  timeZone: "UTC",
};

onMounted(() => {
  fetchDataById(route.params.id);
});
</script>

<template>
  <!-- edit modal -->
  <div
    v-if="showEditModal"
    class="fixed z-10 inset-0 overflow-y-auto flex items-center justify-center"
  >
    <div
      class="bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-2xl sm:w-full bg-opacity-50"
    >
      <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div class="sm:flex sm:items-start">
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              <input
                type="text"
                v-model="selectedTodo.title"
                class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              />
            </h3>
            <div class="mt-2">
              <textarea
                v-model="selectedTodo.description"
                class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md h-32"
              >
                 {{
                  selectedTodo.description || "No Description Provided"
                }}
                </textarea
              >
            </div>
            <div class="mt-2">
              <label
                for="status"
                class="block text-sm font-medium text-gray-700"
                >Status</label
              >
              <select
                id="status"
                v-model="selectedTodo.status"
                class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option
                  v-for="status in ['NO_STATUS', 'TO_DO', 'DOING', 'DONE']"
                  :value="status"
                >
                  {{ formatStatus(status) }}
                </option>
              </select>
              <div class="mt-2">
                <label for="assignees" class="block text-sm font-medium text-gray-700">Assignees</label>
                <input
                  id="assignees"
                  v-model="assigneesText"
                  class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>
            <div class="mt-2">
              <label class="block text-sm font-medium text-gray-700"
                >Created On</label
              >
              <p>{{ formatDate(selectedTodo.createdOn) }}</p>
            </div>
            <div class="mt-2">
              <label class="block text-sm font-medium text-gray-700"
                >Updated On</label
              >
              <p>{{ formatDate(selectedTodo.updatedOn) }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button
          @click="closeModalWithEdit"
          type="button"
          class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
        >
          Save
        </button>
        <button
          @click="closeModal"
          type="button"
          class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
        >
          Close
        </button>
      </div>
    </div>
  </div>
  </div>
</template>
