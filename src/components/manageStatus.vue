<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
let statuses = ref([]);
const showDeleteModal = ref(false);
let selectedDeletedStatus = ref(null);

const openDeleteModal = (status) => {
  selectedDeletedStatus.value = status;
  showDeleteModal.value = true;
};

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

const confirmDelete = async () => {
  try {
    const tasks = await fetchTasksByStatus(selectedDeletedStatus.value.id);
    const isStatusInUse = tasks.length > 0;
    console.log(fetchTasksByStatus(selectedDeletedStatus.value.id));

    if (isStatusInUse) {
      showTransferModal.value = true;
    } else {
      await deleteStatus(selectedDeletedStatus.value.id);
      showDeleteModal.value = false;
      showTransferModal.value = false;
      await fetchStatuses();
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

const deleteStatus = async (statusId, newStatusId) => {
  // let url = `http://ip23or3.sit.kmutt.ac.th:8080/v2/statuses/${statusId}`;
  let url = `http://localhost:8080/v2/statuses/${statusId}`;
  if (newStatusId) {
    url += `/${newStatusId}`;
  }

  const response = await fetch(url, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete status");
  }
};

const confirmTransfer = async () => {
  try {
    await deleteStatus(selectedDeletedStatus.value.id, newStatus.value);
    showTransferModal.value = false;
    showDeleteModal.value = false; // add this line
    selectedDeletedStatus.value = null;
    await fetchStatuses();
  } catch (error) {
    console.error("Error:", error);
  }
};
const fetchTasksByStatus = async (statusId) => {
  const response = await fetch(
    // `http://ip23or3.sit.kmutt.ac.th:8080/v2/tasks?statusId=${statusId}`

    `http://localhost:8080/v2/tasks?statusId=${statusId}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }
  const tasks = await response.json();
  return tasks.filter(
    (task) => task.statusName === selectedDeletedStatus.value.name
  );
};

const fetchStatuses = async () => {
  try {
    // const response = await fetch("http://ip23or3.sit.kmutt.ac.th:8080/v2/statuses");
    const response = await fetch("http://localhost:8080/v2/statuses");
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
</script>
<template>
  <div class="w-full flex flex-col items-start h-screen bg-slate-400">
    <div class="flex justify-between w-full mb-7 relative px-4">
      <div>
        <button @click="goBack" class="btn btn-accent mt-4">Back</button>
      </div>
      <div class="flex justify-center w-full">
        <span class="text-2xl md:text-3xl font-bold mb-3 text-black pt-4">
          ITBKK-Kradan Kanban
        </span>
      </div>
      <div></div>
      <span
        class="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-green-600 rounded-full"
      ></span>
    </div>

    <div class="w-3/4 mx-auto">
      <table class="table-lg style bg-blue-700 text-lg w-full rounded-lg shadow-lg overflow-hidden">
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
              class="text-center px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 border-b border-gray-200"
            >
              {{ status.statusDescription }}
            </td>
            <td
              class="text-center px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 border-b border-gray-200"
            >
              <button
                v-if="status.name !== 'No Status'"
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
                v-if="status.name !== 'No Status'"
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
          class="bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full"
        >
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="flex flex-col items-center justify-center text-center">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                Do you want to delete the status number
                {{ selectedDeletedStatus.id }}
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
          class="bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full"
        >
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="flex flex-col items-center justify-center text-center">
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                The status "{{ selectedDeletedStatus.name }}" is currently in
                use by a task. Please select a new status for these tasks.
              </h3>
              <select v-model="newStatus" class="mt-4">
                <option
                  v-for="status in statuses"
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
