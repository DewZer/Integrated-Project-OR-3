<script setup>
import { ref, onMounted, nextTick, computed } from "vue";
import { watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
const API_ROOT = import.meta.env.VITE_BASE_URL;

const selectedTodo = ref(null);
const showEditModal = ref(false);
const toast = useToast();
const route = useRoute();
const router = useRouter();
let errorMessage = ref("");
let assigneesText = ref("");
const originalTodo = ref(null);
const isSaveButtonDisabled = ref(true);
const statuses = ref([]);

const fetchStatuses = async () => {
  try {

    const response = await fetch(
      // `http://intproj23.sit.kmutt.ac.th:8080/or3/v2/statuses`
      `${API_ROOT}/v2/statuses`
    );
    // console.log("fetching statuses");
    if (!response.ok) {
      throw new Error("Failed to fetch statuses");
    }

    const data = await response.json();
    statuses.value = data.map((status) => status.name);
    // console.log(statuses.value);
  } catch (error) {
    console.error("Error:", error);
  }
};

const fetchDataById = async (id) => {
  try {
    const response = await fetch(
      // `http://ip23or3.sit.kmutt.ac.th:8080/v2/tasks/${id}`
      // `http://localhost:8080/v2/tasks/${id}`
      // `http://intproj23.sit.kmutt.ac.th:8080/or3/v2/tasks/${id}`
      `${API_ROOT}/v2/tasks/${id}`

    );

    if (!response.ok) {
      throw new Error("No task found with this ID");
    }
    const data = await response.json();
    selectedTodo.value = data;
    originalTodo.value = { ...data };
    assigneesText.value = data.assignees;
    // console.log(selectedTodo.value);
    showEditModal.value = true;
  } catch (error) {
    console.error("Error:", error);
    alert("No task found with this ID");
    router.push({ path: "/task" });
  }
};

const closeModalWithEdit = async () => {
  // trim
  selectedTodo.value.title = selectedTodo.value.title.trim();

  if (selectedTodo.value.description) {
    selectedTodo.value.description = selectedTodo.value.description.trim();
  }
  if (assigneesText.value) {
    assigneesText.value = assigneesText.value.trim();
  }

  if (!selectedTodo.value.title) {
    errorMessage.value = "Title is required";
    return;
  }

  const todoToUpdate = { ...selectedTodo.value };

  todoToUpdate.assignees = assigneesText.value;

  if (!todoToUpdate.assignees) {
    delete todoToUpdate.assignees;
  }

  delete todoToUpdate.createdOn;
  delete todoToUpdate.updatedOn;

  try {
    const response = await fetch(
      // `http://localhost:8080/v2/tasks/${todoToUpdate.id}`,
      // `http://ip23or3.sit.kmutt.ac.th:8080/v2/tasks/${todoToUpdate.id}`,
      // `http://intproj23.sit.kmutt.ac.th:8080/or3/v2/tasks/${todoToUpdate.id}`,
      `${API_ROOT}/v2/tasks/${todoToUpdate.id}`,
      {
        method: "PUT",
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
    await fetchDataById(todoToUpdate.id);
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


const closeModal = () => {
  showEditModal.value = false;
  router.push({ path: "/task" });
};

function deepEqual(a, b) {
  if (a === b) return true;

  if (a instanceof Date && b instanceof Date)
    return a.getTime() === b.getTime();

  if (!a || !b || (typeof a !== "object" && typeof b !== "object"))
    return a === b;

  if (a.prototype !== b.prototype) return false;

  let keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;

  return keys.every((k) => deepEqual(a[k], b[k]));
}

watch(
  [selectedTodo, assigneesText],
  () => {
    isSaveButtonDisabled.value =
      !selectedTodo.value.title.trim() ||
      (deepEqual(selectedTodo.value, originalTodo.value) &&
        assigneesText.value === originalTodo.value.assignees);
  },
  { deep: true }
);

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

const isInputTooLong = (input, maxLength) => {
  return input && input.length > maxLength;
};

const isAnyInputTooLong = computed(() => {
  return (
    isInputTooLong(selectedTodo.value.title, 100) ||
    isInputTooLong(selectedTodo.value.description, 500) ||
    isInputTooLong(selectedTodo.value.assigneesText, 30)
  );
});

watch(
  [selectedTodo, assigneesText],
  () => {
    isSaveButtonDisabled.value =
      !selectedTodo.value.title.trim() ||
      isInputTooLong(assigneesText.value, 30) ||
      (deepEqual(selectedTodo.value, originalTodo.value) &&
        assigneesText.value === originalTodo.value.assignees);
  },
  { deep: true }
);

onMounted(async () => {
  await fetchStatuses();
  fetchDataById(route.params.id);
});
</script>

<template>
  <div
    v-if="showEditModal"
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
                v-model="selectedTodo.title"
                class="input input-bordered w-full bg-gray-200 rounded-lg text-black mt-2"
                placeholder="Title"
              />
              <p
                v-if="isInputTooLong(selectedTodo.title, 100)"
                class="text-red-500 text-sm"
              >
                Title is too long
              </p>
            </h3>

            <div class="mt-2">
              <label for="description" class="label">
                <span class="label-text text-2xl text-green-400 font-bold"
                  >Description</span
                >
              </label>
              <textarea
                v-model="selectedTodo.description"
                :placeholder="
                  selectedTodo.description ? '' : 'No description provided'
                "
                :class="[
                  'textarea textarea-bordered w-full h-24 rounded-lg textarea-md text-lg',
                  {
                    'bg-gray-300': selectedTodo.description,
                    'bg-gray-200': !selectedTodo.description,
                  },
                ]"
              ></textarea>
              <p
                v-if="isInputTooLong(selectedTodo.description, 500)"
                class="text-red-500 text-sm"
              >
                Description is too long
              </p>
            </div>

            <div class="mt-2">
              <label for="status" class="label">
                <span class="label-text text-lg font-bold text-yellow-400"
                  >Status</span
                >
              </label>
              <select
                v-if="statuses.length > 0"
                id="status"
                v-model="selectedTodo.status"
                class="select select-bordered w-full text-md bg-gray-200 rounded-lg"
              >
                <option v-for="status in statuses" :value="status">
                  {{ status }}
                </option>
              </select>
            </div>

            <div class="mt-2">
              <label for="itbkk-assignees" class="label">
                <span class="label-text text-xl font-bold text-blue-200"
                  >Assignees</span
                >
              </label>
              <input
                id="assignees"
                v-model="assigneesText"
                class="input input-bordered w-full bg-gray-200"
                :placeholder="assigneesText ? 'Assignees' : 'Unassigned'"
                :class="{ italic: !assigneesText }"
              />
              <p
                v-if="isInputTooLong(assigneesText, 30)"
                class="text-red-500 text-sm"
              >
                Assignees is too long
              </p>

            </div>

            <div
              class="mt-2 bg-gray-500 rounded-md flex items-center justify-center"
            >
              <label for="status" class="label">
                <span class="label-text text-md text-white text-lg"
                  >Timezone : {{ getTimeZone() }}</span
                >
              </label>
            </div>

            <div
              class="mt-3 p-3 bg-gray-400 rounded-lg shadow flex flex-col items-center justify-center"
            >
              <div class="mb-2 w-full flex flex-col items-center">
                <label class="label">
                  <span class="label-text text-lg text-black">Created On</span>
                </label>
                <p class="mt-1 text-xl font-semibold text-gray-900">
                  {{ formatDate(selectedTodo.createdOn) }}
                </p>
              </div>

              <div class="mt-2 w-full flex flex-col items-center">
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
            @click="closeModalWithEdit"
            type="button"
            class="btn btn-outline btn-success ml-2 sm:ml-4"
            :disabled="isSaveButtonDisabled || isAnyInputTooLong"
          >
            Save
          </button>
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

<style scoped>
.unassigned-style {
  background-color: #f0f0f0; /* Light grey background */
  color: #ccc; /* Grey text */
}
</style>
