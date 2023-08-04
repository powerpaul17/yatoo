<template>
  <div>
    <!-- Backdrop -->
    <div
      class="
        absolute top-0
        h-full w-full
        cursor-pointer
        bg-black/40
        transition-colors
        duration-200
        md:hidden
      "
      :class="{ 'pointer-events-none bg-transparent': !todoId }"
      @click="handleClose()"
    />

    <!-- Sidebar -->
    <div
      class="
        absolute right-0 top-0
        h-full w-full
        bg-base-200
        p-2
        shadow-md
        transition-all
        duration-300
        sm:w-80
        md:static
      "
      :class="{ 'mr-[-100%] sm:-mr-80': !todoId }"
    >
      <div class="flex">
        <button
          class="btn-ghost btn-circle btn"
          @click="handleClose()"
        >
          <X />
        </button>

        <div class="grow" />

        <button
          class="btn-ghost btn-warning btn-circle btn"
          @click="handleDelete()"
        >
          <Trash />
        </button>
      </div>
    </div>
  </div>

  <DeleteDialog
    :open="deleteDialogOpen"
    @close="deleteDialogOpen = false"
    @delete="handleDeleteTodo()"
  />
</template>

<script setup lang="ts">

  import { ref } from 'vue';
  import { useRouter } from 'vue-router';

  import { Trash, X } from 'lucide-vue-next';

  import DeleteDialog from '../dialogs/DeleteDialog.vue';

  defineProps({
    todoId: {
      type: String,
      default: null
    }
  });

  const router = useRouter();

  async function handleClose(): Promise<void> {
    await router.push({
      query: {
        todoId: undefined
      }
    });
  }

  const deleteDialogOpen = ref(false);

  function handleDelete(): void {
    deleteDialogOpen.value = true;
  }

  async function handleDeleteTodo(): Promise<void> {

  }

</script>