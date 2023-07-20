<template>
  <label class="swap btn-ghost swap-rotate btn-circle btn">
    <input
      type="checkbox"
      v-model="darkmode"
    >
    <Sun class="swap-off" />
    <MoonStar class="swap-on" />
  </label>
</template>

<script setup lang="ts">

  import { onMounted, ref, watch } from 'vue';

  import { MoonStar, Sun } from 'lucide-vue-next';

  const darkmode = ref(false);

  function updateClass(): void {
    if (darkmode.value) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  onMounted(() => {
    updateClass();
  });

  watch(darkmode, () => {
    updateClass();
  });

</script>
