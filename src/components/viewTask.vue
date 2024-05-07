<script setup>
import { ref, onMounted, nextTick, computed } from "vue";
import { watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";

const selectedTodo = ref(null);
const showViewModal = ref(false);
const toast = useToast();
const route = useRoute();
const router = useRouter();


const fetchDataById = async (id) => {
  try {
    const response = await fetch(
      `http://ip23or3.sit.kmutt.ac.th:8080/v1/tasks/${id}`

      // `http://localhost:8080/v1/tasks/${id}`
    );

    if (!response.ok) {
      throw new Error("No task found with this ID");
    }
    const data = await response.json();
    selectedTodo.value = data;
    assigneesText.value = data.assignees;
    console.log(selectedTodo.value);
    showViewModal.value = true;
  } catch (error) {
    console.error("Error:", error);
    alert("No task found with this ID");
    router.push({ path: "/task" });
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

watch(showViewModal, (newVal) => {
  if (newVal) {
    openModal();
  }
});

const closeModal = () => {
  showViewModal.value = false;
  router.push({ path: "/task" });
};

const formatDate = (dateString) => {
  const options = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  };
  return new Intl.DateTimeFormat("en-GB", options).format(new Date(dateString));
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
  fetchDataById(route.params.id);
});
</script>

<template>
  <div
    v-if="showViewModal"
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
                <span class="label-text text-2xl font-bold text-pink-400">Title</span>
              </label>
              <input
                type="text"
                v-model="selectedTodo.title"
                class="input input-bordered w-full bg-gray-500 rounded-lg text-black mt-2"
                disabled
                style="color: black !important"
              />
            </h3>

            <div class="mt-2">
              <label for="description" class="label">
                <span class="label-text text-2xl text-green-400 font-bold">Description</span>
              </label>
              <textarea
                v-model="selectedTodo.description"
                :placeholder="
                  selectedTodo.description ? '' : 'No description provided'
                "
                :class="[
                  'textarea textarea-bordered w-full h-24 rounded-lg textarea-md text-lg',
                  {
                    'bg-gray-500': selectedTodo.description,
                    'bg-gray-200': !selectedTodo.description,
                  },
                ]"
                disabled
                style="color: black !important"
              ></textarea>
            </div>

            <div class="mt-2 bg-gray-500 rounded-md">
              <label for="status" class="label">
                <span class="label-text text-md text-white"
                  >Timezone : {{ getTimeZone() }}</span
                >
              </label>
            </div>

            <div class="mt-2">
              <label for="status" class="label">
                <span class="label-text text-lg font-bold text-yellow-400">Status</span>
              </label>
              <select
                id="status"
                v-model="selectedTodo.status"
                class="select select-bordered w-full text-md bg-gray-800 rounded-lg"
                disabled
                style="color: black !important"
              >
                <option
                  v-for="status in ['NO_STATUS', 'TO_DO', 'DOING', 'DONE']"
                  :value="status"
                >
                  {{ formatStatus(status) }}
                </option>
              </select>
            </div>

            <div class="mt-2">
              <label for="itbkk-assignees" class="label">
                <span class="label-text text-xl font-bold text-blue-200">Assignees</span>
              </label>
              <input
                id="assignees"
                v-model="assigneesText"
                class="input input-bordered w-full"
                :placeholder="assigneesText ? 'Assignees' : 'Unassigned'"
                :class="{ italic: !assigneesText }"
                disabled
                style="color: black !important"
              />
            </div>

            <div class="mt-3 p-3 bg-gray-400 rounded-lg shadow flex flex-col items-center justify-center">
  <div class="mb-2 w-full text-center">
    <label class="label">
      <span class="label-text text-lg text-black">Created On</span>
    </label>
    <p class="mt-1 text-xl font-semibold text-gray-900">
      {{ formatDate(selectedTodo.createdOn) }}
    </p>
  </div>

  <div class="mt-2 w-full text-center">
    <label class="label">
      <span class="label-text text-lg text-black">Updated On</span>
    </label>
    <p class="mt-1 text-xl font-semibold text-gray-900">
      {{ formatDate(selectedTodo.updatedOn) }}
    </p>
  </div>
</div>


          </div>
        </div>

        <div
          class="bg-grey-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t mt-3"
        >

          <button
            @click="closeModal"
            type="button"
            class="itbkk-button-cancel btn btn-outline btn-error"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
