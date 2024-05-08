<script setup>
import { ref, onMounted } from "vue";
import {  useRouter } from "vue-router";

const router = useRouter();
let statuses = ref([]);
const showDeleteModal = ref(false);
let selectedDeletedStatus = ref(null)

const openDeleteModal = (status) => {
  selectedDeletedStatus.value = status;
  showDeleteModal.value = true;
};


let showTransferModal = ref(false);
let newStatus = ref(null);


const confirmTransfer = async () => {
  // Fetch all tasks with the status being deleted
  const tasks = await fetchTasksByStatus(selectedDeletedStatus.value.id);

  // For each task, update its status to the new status
  for (let task of tasks) {
    await updateTaskStatus(task.id, newStatus.value);
  }

  // After all tasks have been transferred, delete the old status
  await deleteStatus(selectedDeletedStatus.value.id);

  // Close the transfer modal
  showTransferModal.value = false;

  // Refresh the list of statuses
  statuses.value = await fetchStatuses();
};

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
    // Fetch all tasks
    const tasks = await fetchTasksByStatus(selectedDeletedStatus.value.id);

    // Check if any task uses the status being deleted
    const isStatusInUse = tasks.length > 0;

    if (isStatusInUse) {
      // If the status is in use, open the transfer modal
      showTransferModal.value = true;
    } else {
      // If the status is not in use, proceed with deletion
      await deleteStatus(selectedDeletedStatus.value.id);

      // Close the modal
      showDeleteModal.value = false;
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
const fetchTasksByStatus = async (statusId) => {
  const response = await fetch(`http://localhost:8080/v2/tasks?statusId=${statusId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return await response.json();
};

const updateTaskStatus = async (taskId) => {
  const response = await fetch(`http://localhost:8080/v2/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ statusId: newStatus, name: name }),
  });
  if (!response.ok) {
    throw new Error('Failed to update task status');
  }
};

const deleteStatus = async (statusId) => {
  const response = await fetch(`http://localhost:8080/v2/statuses/${statusId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete status');
  }
};

onMounted(async () => {
  try {
    const response = await fetch("http://localhost:8080/v2/statuses");
    if (!response.ok) {
      throw new Error("Failed to fetch statuses");
    }
    const data = await response.json();
    statuses.value = data.sort((a, b) => a.id - b.id);
  } catch (error) {
    console.error("Error:", error);
  }
});



</script>

<template>
  <div class="w-full flex flex-col items-start h-screen bg-slate-400">
    <div class="flex justify-between w-full mb-7 relative px-4">
      <div>
        <button @click="goBack" class="btn btn-accent mt-4">Back</button>      </div>
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
      <table class="table-lg style bg-gray-700 dark:bg-gray-700 text-lg w-full">
        <thead class="bg-gray-200 w-full">
          <tr>
            <th class="w-1/6 text-black text-center">Id</th>
            <th class="w-1/3 text-black text-center">Status</th>
            <th class="w-1/3 text-black text-center">Description</th>
            <th class="w-1/12 text-black text-center"></th>
            <th class="w-1/12 text-black text-center">
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
          <tr v-for="status in statuses" :key="status.id" class="text-gray-800">
            <td class="text-center">{{ status.id }}</td>
            <td class="text-center">{{ status.name }}</td>
            <td class="text-center">{{ status.statusDescription }}</td>
            <td class="text-center">
              <button
                @click="gotoEditStatus(status)"
                class="itbkk-button-edit btn btn-outline btn-primary bg-blue-200 btn-md"
              >
                Edit
              </button>
            </td>
            <td class="text-center">
              <button
                @click="openDeleteModal(status)"
                class="itbkk-button-delete btn btn-outline btn-danger bg-red-200 btn-md"
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
              @click="confirmDelete"
              @keyup.enter="confirmDelete"
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
            The status "{{ selectedDeletedStatus.name }}" is currently in use by a task. Please select a new status for these tasks.
          </h3>
          <select v-model="newStatus" class="mt-4">
            <option v-for="status in statuses" :value="status.id" :key="status.id">
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
