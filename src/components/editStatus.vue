<script setup>
import { ref, onMounted, nextTick, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { reactive, watchEffect } from "vue";
import { isEqual } from "lodash";
const API_ROOT = import.meta.env.VITE_BASE_URL;


let selectedStatus = ref(null);
let originalStatus = ref(null);
const showEditModal = ref(false);
const toast = useToast();
const route = useRoute();
const router = useRouter();
let errorMessage = ref("");
const isSaveButtonDisabled = ref(true);

const fetchDataById = async (id) => {
  try {

    const response = await fetch(`${API_ROOT}/v2/statuses/${id}`);

    if (!response.ok) {
      throw new Error("No status found with this ID");
    }
    const data = await response.json();
    selectedStatus.value = reactive(data);
    originalStatus.value = reactive({ ...data });
    showEditModal.value = true;
    // console.log(selectedStatus.value);
  } catch (error) {
    console.error("Error:", error);
    alert("No status found with this ID");
    router.push({ path: "/status" });
  }
};

const closeModal = () => {
  showEditModal.value = false;
  router.push({ path: "/task/status" });
};

const closeModalWithEdit = async () => {
  selectedStatus.value = {
    ...selectedStatus.value,
    name: selectedStatus.value.name.trim(),
    description: selectedStatus.value.description
      ? selectedStatus.value.description.trim()
      : null,
  };

  if (!selectedStatus.value.name) {
    errorMessage.value = "Name is required";
    return;
  }

  const statusToUpdate = { ...selectedStatus.value };

  delete statusToUpdate.createdOn;
  delete statusToUpdate.updatedOn;

  try {

    // const response = await fetch(`http://intproj23.sit.kmutt.ac.th:8080/or3/v2/statuses/${statusToUpdate.id}`, {
    const response = await fetch(`${API_ROOT}/v2/statuses/${statusToUpdate.id}`, {


        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(statusToUpdate),
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    toast.success("The status has been updated");
    showEditModal.value = false;
    await fetchDataById(statusToUpdate.id);
    router.push({ path: "/task/status" });
  } catch (error) {
    console.error("Error:", error);
    toast.error("The update was unsuccessful");
  }
};

watchEffect(() => {
  isSaveButtonDisabled.value =
    !selectedStatus.value?.name.trim() ||
    isEqual(selectedStatus.value, originalStatus.value);
});

onMounted(() => {
  const id = route.params.id;
  fetchDataById(id);
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
              <label for="status-name" class="label">
                <span class="label-text text-2xl font-bold text-pink-400"
                  >Status :</span
                >
              </label>
              <input
                id="status-name"
                v-model="selectedStatus.name"
                type="text"
                class="input input-bordered w-full bg-gray-200 rounded-lg text-black mt-2"
                placeholder="Status"
              />

              <label for="status-description" class="label mt-4">
                <span class="label-text text-2xl font-bold text-pink-400"
                  >Description</span
                >
              </label>
              <textarea
                id="status-description"
                v-model="selectedStatus.description"
                class="textarea textarea-bordered w-full h-24 rounded-lg textarea-md text-lg bg-gray-200 mt-2"
                :placeholder="
                  selectedStatus.description
                    ? ''
                    : 'No description provided'
                "
              ></textarea>
              <p v-if="errorMessage" class="text-red-500">{{ errorMessage }}</p>
            </h3>
          </div>
        </div>

        <div
          class="bg-grey-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t mt-3"
        >
          <button
            @click="closeModalWithEdit"
            type="button"
            class="btn btn-outline btn-success ml-2 sm:ml-4"
            :disabled="isSaveButtonDisabled"
          >
            Save
          </button>
          <button
            @click="closeModal"
            type="button"
            class="btn btn-outline btn-error"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
