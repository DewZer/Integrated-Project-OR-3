<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { computed } from "vue";

const toast = useToast();
const router = useRouter();
let statuses = ref([]);
const showDeleteModal = ref(false);
let selectedDeletedStatus = ref(null);
let selectedStatusTaskCount = ref(0);
let showTransferModal = ref(false);
let newStatus = ref(null);

const goBack = () => {
  router.push({ path: `/task` });
};

const gotoAddStatus = () => {
  router.push({ path: "/task/status/add" });
};

const gotoEditStatus = (status) => {
  router.push({ path: `/task/status/${status.id}` });
};

const openDeleteModal = async (status) => {
  try {
    if (status) {
      selectedDeletedStatus.value = status;
      const tasks = await fetchTasksByStatus(status.id);
      const isStatusInUse = tasks.length > 0;
      // console.log("tasks:", tasks);
      if (isStatusInUse) {
        showTransferModal.value = true;
      } else {
        showDeleteModal.value = true;
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

const confirmDelete = async () => {
  try {
    if (selectedDeletedStatus.value) {
      const tasks = await fetchTasksByStatus(selectedDeletedStatus.value.id);
      const isStatusInUse = tasks.length > 0;
      if (isStatusInUse) {
        showTransferModal.value = true;
        showDeleteModal.value = false;
      } else {
        await deleteStatus(selectedDeletedStatus.value.id);
        showDeleteModal.value = false;
        showTransferModal.value = false;
        await fetchStatuses();
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

const deleteStatus = async (statusId, newStatusId) => {
  // let url = `http://localhost:8080/v2/statuses/${statusId}`;
  // let url = `http://ip23or3.sit.kmutt.ac.th:8080/v2/statuses/${statusId}`;
  let url = `http://intproj23.sit.kmutt.ac.th:8080/or3/v2/statuses/${statusId}`;

  if (newStatusId) {
    url += `/${newStatusId}`;
  }

  const response = await fetch(url, {
    method: "DELETE",
  });
  if (!response.ok) {
    if (response.status === 404) {
      toast.error("An error has occurred, the status does not exist.");
    } else {
      toast.error("Failed to delete status");
    }
    setTimeout(() => {
      location.reload();
    }, 1500);
    throw new Error("Failed to delete status");
  }
  toast.success("The status has been deleted");
};

const confirmTransfer = async () => {
  try {
    await deleteStatus(selectedDeletedStatus.value.id, newStatus.value);
    showTransferModal.value = false;
    showDeleteModal.value = false;
    selectedDeletedStatus.value = null;
    await fetchStatuses();
  } catch (error) {
    console.error("Error:", error);
    toast.error("An error has occurred while transferring the status.");
  }
};

const fetchTasksByStatus = async (statusId) => {
  const response = await fetch(
    // `http://localhost:8080/v2/tasks?statusId=${statusId}`
    // `http://ip23or3.sit.kmutt.ac.th:8080/v2/tasks?statusId=${statusId}`
    `http://intproj23.sit.kmutt.ac.th:8080/or3/v2/tasks?statusId=${statusId}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }
  const tasks = await response.json();
  return tasks.filter(
    (task) => task.status === selectedDeletedStatus.value.name
  );
};

const fetchStatuses = async () => {
  try {
    const response = await fetch(
      // "http://localhost:8080/v2/statuses"
      // "http://ip23or3.sit.kmutt.ac.th:8080/v2/statuses"
      "http://intproj23.sit.kmutt.ac.th:8080/or3/v2/statuses"
    );
    if (!response.ok) {
      throw new Error("Failed to fetch statuses");
    }
    const data = await response.json();
    statuses.value = data.sort((a, b) => a.id - b.id);
  } catch (error) {
    console.error("Error:", error);
  }
};

onMounted(async () => {
  await fetchStatuses();
  const noStatus = statuses.value.find((status) => status.name === "No Status");
  if (noStatus) {
    newStatus.value = noStatus.id;
  }
});

// count tasks for the selected status
watch(
  selectedDeletedStatus,
  async (newStatus) => {
    if (newStatus) {
      const tasks = await fetchTasksByStatus(newStatus.id);
      selectedStatusTaskCount.value = tasks.length;
    }
  },
  { immediate: true }
);

const availableStatuses = computed(() => {
  return statuses.value.filter(
    (status) => status.id !== selectedDeletedStatus.value?.id
  );
});
</script>
<template>
  <div></div>
  <div class="w-full flex flex-col items-start h-screen bg-slate-400">
    <div class="flex justify-center w-full mb-7 relative">
      <button @click="goBack" class="btn btn-accent mt-4 absolute top-0 left-2">
        Back
      </button>
      <span
        class="text-2xl md:text-4xl font-bold mb-3 text-white pt-4 shadow-lg"
      >
        ITBKK-Kradan Kanban
      </span>
      <span
        class="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-green-600 rounded-full"
      ></span>
    </div>

    <div class="w-3/4 mx-auto">
      <table
        class="table-lg style bg-blue-700 text-lg w-full rounded-lg shadow-lg overflow-hidden"
      >
        <thead
          class="w-full bg-gradient-to-r from-yellow-500 via-red-200 to-purple-600"
        >
          <tr>
            <th class="w-1/6 text-center text-gray-800 py-2">ID</th>
            <th class="w-1/3 text-center text-gray-800 py-2">Status</th>
            <th class="w-1/3 text-center text-gray-800 py-2">Description</th>
            <th class="w-1/12 text-center text-gray-800 py-2"></th>
            <th class="w-1/12 text-center py-2">
              <button
                @click="gotoAddStatus"
                class="itbkk-button-add btn btn-outline btn-success bg-green-200 btn-md"
              >
                Add Status
              </button>
            </th>
          </tr>
        </thead>

        <!-- body -->
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="(status, index) in statuses"
            :key="status.id"
            class="text-gray-800 hover:bg-gray-100 transition duration-200 ease-in-out transform hover:-translate-y-0.5 hover:scale-80"
          >
            <td
              class="text-center px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 border-b border-gray-200"
            >
              {{ index + 1 }}
            </td>
            <td
              class="text-center px-6 py-4 whitespace-nowrap text-2sm font-medium text-blue-600 border-b border-gray-200"
            >
              {{ status.name }}
            </td>
            <td
              class="text-center px-6 py-4 whitespace-nowrap text-sm font-medium border-b border-gray-200"
              :class="status.description ? 'text-green-600' : 'text-red-600'"
            >
              {{
                status.description
                  ? status.description
                  : "No description provided"
              }}
            </td>
            <td
              class="text-center px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 border-b border-gray-200"
            >
              <button
                v-if="status.name !== 'no status'"
                @click="gotoEditStatus(status)"
                class="itbkk-button-edit btn btn-outline btn-primary bg-blue-200 btn-md"
              >
                Edit
              </button>
              <button
                v-else
                disabled
                class="itbkk-button-edit btn btn-outline btn-primary bg-blue-200 btn-md opacity-0"
              >
                Edit
              </button>
            </td>
            <td
              class="text-center px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 border-b border-gray-200"
            >
              <button
                v-if="status.name !== 'no status'"
                @click="openDeleteModal(status)"
                class="itbkk-button-delete btn btn-outline btn-danger bg-red-200 btn-md"
              >
                Delete
              </button>
              <button
                v-else
                disabled
                class="itbkk-button-delete btn btn-outline btn-danger bg-red-200 btn-md opacity-0"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div
        v-if="showDeleteModal"
        class="fixed z-10 inset-0 overflow-y-auto flex items-center justify-center bg-slate-500 bg-opacity-25"
      >
        <div
          class="bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full border-red-400 border-2"
        >
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="flex flex-col items-center justify-center text-center">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Do you want to delete the status
              </h3>
              <h3
                class="text-lg leading-6 font-medium text-gray-900 truncate-title"
              >
                {{ selectedDeletedStatus.name }}
              </h3>
            </div>
          </div>

          <div
            class="bg-gray-50 px-4 py-3 sm:px-6 flex justify-center sm:flex-row-reverse overflow-auto"
          >
            <button
              @click="
                confirmDelete();
                showDeleteModal = false;
              "
              @keyup.enter="
                confirmDelete();
                showDeleteModal = false;
              "
              ref="deleteButton"
              type="button"
              class="itbkk-button-delete w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Delete
            </button>
            <button
              @click="showDeleteModal = false"
              type="button"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="showTransferModal"
        class="fixed z-10 inset-0 overflow-y-auto flex items-center justify-center bg-slate-500 bg-opacity-25"
      >
        <div
          class="bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full border-red-400 border-2"
        >
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="flex flex-col items-center justify-center text-center">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                The status "{{ selectedDeletedStatus.name }}" is currently in
                use {{ selectedStatusTaskCount }} task. Please select a new
                status for these tasks.
              </h3>
              <select v-model="newStatus" class="mt-4 bg-gray-200 rounded-md">
                <option
                  v-for="status in availableStatuses"
                  :value="status.id"
                  :key="status.id"
                >
                  {{ status.name }}
                </option>
              </select>
            </div>
          </div>

          <div
            class="bg-gray-50 px-4 py-3 sm:px-6 flex justify-center sm:flex-row-reverse overflow-auto"
          >
            <button
              @click="confirmTransfer"
              type="button"
              class="itbkk-button-delete w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Transfer and Delete
            </button>
            <button
              @click="showTransferModal = false"
              type="button"
              class="itbkk-button-cancel w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-600 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
