<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
const API_ROOT = import.meta.env.VITE_BASE_URL;


const router = useRouter();
const toast = useToast();
const showAddModal = ref(true);
const newStatus = ref({ name: '', description: '' });

const closeModal = () => {
  showAddModal.value = false;
  router.push('/task/status');
};

const addStatus = async () => {
  newStatus.value.name = newStatus.value.name?.trim();
  newStatus.value.description = newStatus.value.description?.trim();

  if (newStatus.value.description === '') {
    newStatus.value.description = null;
  }

  
  const responseStatuses = await fetch(`${API_ROOT}/v2/statuses`);
  const existingStatuses = await responseStatuses.json();

  // status name is unique
  if (existingStatuses.some(status => status.name === newStatus.value.name)) {
    toast.error('Status name must be unique');
    return;
  }

  // post new status
  const response = await fetch(`${API_ROOT}/v2/statuses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newStatus.value)
  });

  if (!response.ok) {
    console.error('Failed to add status', response);
    toast.error('Failed to add status');
    return;
  }

  newStatus.value = { name: '', description: '' };
  closeModal();
  toast.success('Status added successfully');
};

const MAX_NAME_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 200;

const isNameTooLong = computed(() => newStatus.value.name.length > MAX_NAME_LENGTH);
const isDescriptionTooLong = computed(() => newStatus.value.description.length > MAX_DESCRIPTION_LENGTH);


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
                <label for="status" class="label">
                  <span class="label-text text-2xl font-bold text-pink-400">Status</span>
                </label>
                <input
                  type="text"
                  v-model="newStatus.name"
                  class="input input-bordered w-full bg-gray-200 rounded-lg text-black mt-2"
                  placeholder="Status"
                />
                <p v-if="isNameTooLong" class="text-red-500">Name is too long</p>
              </h3>
  
              <div class="mt-2">
                <label for="description" class="label">
                  <span class="label-text text-2xl text-green-400 font-bold">Description</span>
                </label>
                <textarea
                  v-model="newStatus.description"
                  placeholder="Description"
                  class="textarea textarea-bordered w-full h-24 rounded-lg textarea-md text-lg bg-gray-200"
                  
                ></textarea>
                <p v-if="isDescriptionTooLong" class="text-red-500">Description is too long</p>

              </div>
            </div>
          </div>
  
          <div
            class="bg-grey-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t mt-3"
          >
            <button
              @click="addStatus"
              type="button"
              class="btn btn-outline btn-success ml-2 sm:ml-4"
              :disabled="!newStatus.name.trim() || isNameTooLong || isDescriptionTooLong"
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