<template>
  <li class="">
    <details
      :open="open"
      class="group/details"
    >
      <summary class="group/summary flex list-none rounded-lg">
        <component
          :is="route ? 'router-link' : 'div'"
          :to="route ? route : undefined"
          class="group/link flex w-full rounded-lg p-2 hover:bg-surface-200 dark:hover:bg-surface-800"
          :class="{
            'after:size-2 after:-translate-x-full after:translate-y-full after:-rotate-45 after:border-b-2 after:border-r-2 after:border-black after:content-[\'\'] group-[[open]]/details:after:!rotate-45':
              !!$slots.children,
            'after:!rotate-45': open,
            'hover:after:content-none': !!$slots.buttonIcon
          }"
        >
          <div class="mr-2 flex size-8 shrink-0 items-center justify-center">
            <slot name="icon" />
          </div>

          <div class="flex grow items-center overflow-hidden">
            <span class="flex-auto truncate">{{ title }}</span>

            <Badge
              v-if="badgeValue"
              :value="badgeValue"
              class="ml-2 rounded-full"
            />

            <IconButton
              v-if="$slots.buttonIcon"
              class="-my-2 ml-2 hidden size-8 shrink-0 group-hover/summary:flex group-[.active]/link:flex"
              @click.prevent="emit('button-click', $event)"
            >
              <template #icon>
                <slot name="buttonIcon" />
              </template>
            </IconButton>
          </div>
        </component>
      </summary>

      <ul
        v-if="$slots.children"
        class="ml-2"
      >
        <slot name="children" />
      </ul>
    </details>
  </li>
</template>

<script setup lang="ts">
  import { type PropType } from 'vue';

  import { type RouteLocationRaw } from 'vue-router';

  import Badge from 'primevue/badge';

  import IconButton from '../IconButton.vue';

  defineProps({
    title: {
      type: String,
      required: true
    },
    open: {
      type: Boolean,
      default: false
    },
    route: {
      type: Object as PropType<RouteLocationRaw>,
      default: null
    },
    badgeValue: {
      type: Number,
      default: null
    }
  });

  const emit = defineEmits<{
    (event: 'button-click', originalEvent: Event): void;
  }>();
</script>
