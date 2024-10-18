<template>
  <TransitionGroup
    name="list"
    tag="div"
  >
    <slot />
  </TransitionGroup>
</template>

<style>
  .list-move,
  .list-enter-active,
  .list-leave-active {
    transition: all 0.35s ease;
  }

  .list-enter-from,
  .list-leave-to {
    opacity: 0;
    transform: translateX(30px);
  }

  .list-leave-active {
    position: absolute;
  }
</style>

<script setup lang="ts"></script>
