<template>
  <div class="flex justify-center">IT Bangmod Kradan Kanban</div>
  <br>
  <div class="w-screen flex items-center justify-center overflow-x-hidden">
    <table class="min-w-full w-full">
      <thead>
        <tr class="bg-gray-200 w-full">
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignees</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
        </tr>
      </thead>
      <!-- <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="(todo, index) in todos" :key="index">
          <td class="px-6 py-4 whitespace-nowrap">{{ todo.title }}</td>
          <td class="px-6 py-4 whitespace-nowrap">{{ todo.assignees.join(', ') }}</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span :class="statusClasses(todo.status)">{{ todo.status }}</span>
          </td>
        </tr>
      </tbody> -->
    </table>
  </div>
</template>

<style scoped>

</style>
