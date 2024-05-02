<script setup>
import { ref, onMounted, nextTick } from "vue";
import { watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";

const selectedTodo = ref(null);
const showEditModal = ref(false);
const toast = useToast();
const route = useRoute();
const router = useRouter();
let errorMessage = ref("");
let assigneesText = ref("");

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const fetchDataById = async (id) => {
  try {
    const response = await fetch(`http://localhost:8080/itb-kk/v1/tasks/${id}`);
    if (!response.ok) {
      throw new Error("No task found with this ID");
    }
    const data = await response.json();
    selectedTodo.value = data;
    assigneesText.value = data.assignees;
    console.log(selectedTodo.value);
    showEditModal.value = true;
  } catch (error) {
    console.error("Error:", error);
    alert("No task found with this ID");
    router.push({ path: "/task" });
  }
};

const closeModalWithEdit = async () => {
  if (!selectedTodo.value.title.trim()) {
    errorMessage.value = "Title is required";
    return;
  }

  const todoToUpdate = { ...selectedTodo.value };

  todoToUpdate.assignees = assigneesText.value;

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
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    toast.success("The task has been updated");
    showEditModal.value = false;
    await fetchDataById(todoToUpdate.id); // fetch the task again after it's updated
    router.push({ path: "/task" });
  } catch (error) {
    console.error("Error:", error);
    toast.error("The update was unsuccessful");
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
  router.push({ path: "/task" });
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
  <div v-if="showEditModal" class="fixed z-10 inset-0 overflow-y-auto flex items-center justify-center">
    <div class="bg-gray-800 rounded-lg text-white text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-70% flex flex-col" style="min-width: 80%; max-width: 100%; height: 80%; overflow: auto;">
      <div class="bg-grey sm:p-6 sm:pb-4 flex-grow">
        <div class="sm:flex sm:items-start flex">
          <div class="text-center sm:mt-0 sm:ml-4 sm:text-left flex-grow">

            <h3 class="text-lg leading-6 font-medium text-gray-900">
              <label for="title" class="label">
                <span class="label-text">Title</span>
              </label>
              <input
                type="text"
                v-model="selectedTodo.title"
                class="input input-bordered w-full bg-gray-500 rounded-lg text-white"
              />
            </h3>

            <div class="mt-2 ">
              <label for="description" class="label">
                <span class="label-text">Description</span>
              </label>
              <textarea
                v-model="selectedTodo.description"
                class="te xtarea textarea-bordered w-full h-32 bg-gray-500 rounded-lg"
              >
                {{ selectedTodo.description || "No Description Provided" }}
              </textarea>
            </div>

            <div class="mt-2">
              <label for="status" class="label">
                <span class="label-text">Status</span>
              </label>
              <select
                id="status"
                v-model="selectedTodo.status"
                class="select select-bordered w-full"
              >
                <option
                  v-for="status in ['NO_STATUS', 'TO_DO', 'DOING', 'DONE']"
                  :value="status"
                >
                  {{ formatStatus(status) }}
                </option>
              </select>

              <p class="mt-2 text-lg text-white-700 p-3 rounded-md shadow-md">
                Timezone: {{ timezone }}
              </p>

              <div class="mt-2">
                <label for="itbkk-assignees" class="label">
                  <span class="label-text">Assignees</span>
                </label>
                <input
                  id="assignees"
                  v-model="assigneesText"
                  class="input input-bordered w-full"
                />
              </div>

              <div class="mt-2">
                <label class="label">
                  <span class="label-text">Created On</span>
                </label>
                <p>{{ formatDate(selectedTodo.createdOn) }}</p>
              </div>

              <div class="mt-2">
                <label class="label">
                  <span class="label-text">Updated On</span>
                </label>
                <p>{{ formatDate(selectedTodo.updatedOn) }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="sm:flex justify-end">
          <button
            @click="closeModalWithEdit"
            type="button"
            class="btn btn-primary ml-2 bg-white"
          >
            Save
          </button>
          <button
            @click="closeModal"
            type="button"
            class="btn btn-outline btn-secondary bg-white" 
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>