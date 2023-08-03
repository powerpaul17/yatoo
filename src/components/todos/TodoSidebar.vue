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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

  import { useRouter } from 'vue-router';

  import { X } from 'lucide-vue-next';

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

</script>
