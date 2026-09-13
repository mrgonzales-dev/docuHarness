<template>
  <div class="statusline">
    <!-- drop down for model selector -->
    <div class="model-dropdown" ref="dropdownRef">
      <div class="model-display" @click="toggleDropdown">
        {{ selectedModel || "Select a model..." }}
        <span class="chevron">{{ dropdownOpen ? "▲" : "▼" }}</span>
      </div>
      <div v-if="dropdownOpen" class="model-list">
        <input
          v-model="searchQuery"
          class="model-search"
          placeholder="Search models..."
          ref="searchInput"
          @keydown="onSearchKeydown"
        />
        <div class="model-options">
          <div
            v-for="(model, i) in filteredModels"
            :key="model"
            class="model-option"
            :class="{ active: model === selectedModel, highlighted: i === activeIndex }"
            @click="pickModel(model)"
            @mouseenter="activeIndex = i"
          >
            {{ model }}
          </div>
          <div v-if="filteredModels.length === 0" class="no-results">
            No models found
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from "vue";

const props = defineProps({
  models: { type: Array, default: () => [] },
  selectedModel: { type: String, default: "" },
});

const emit = defineEmits(["update:selectedModel"]);

const dropdownOpen = ref(false);
const searchQuery = ref("");
const searchInput = ref(null);
const activeIndex = ref(0);
const dropdownRef = ref(null);

function handleOutsideClick(e) {
  if (dropdownOpen.value && dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    dropdownOpen.value = false;
    searchQuery.value = "";
  }
}

onMounted(() => {
  document.addEventListener("click", handleOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener("click", handleOutsideClick);
});

const filteredModels = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return props.models;
  return props.models.filter((m) => m.toLowerCase().includes(query));
});

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value;
  if (dropdownOpen.value) {
    searchQuery.value = "";
    activeIndex.value = 0;
    nextTick(() => searchInput.value?.focus());
  }
}

function pickModel(model) {
  emit("update:selectedModel", model);
  dropdownOpen.value = false;
  searchQuery.value = "";
}

function onSearchKeydown(e) {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (activeIndex.value < filteredModels.value.length - 1) {
      activeIndex.value++;
      scrollActiveIntoView();
    }
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (activeIndex.value > 0) {
      activeIndex.value--;
      scrollActiveIntoView();
    }
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (filteredModels.value.length > 0) {
      pickModel(filteredModels.value[activeIndex.value]);
    }
  } else if (e.key === "Escape") {
    e.preventDefault();
    dropdownOpen.value = false;
    searchQuery.value = "";
  }
}

function scrollActiveIntoView() {
  nextTick(() => {
    const options = document.querySelector(".model-options");
    const active = options?.children[activeIndex.value];
    if (active) {
      active.scrollIntoView({ block: "nearest" });
    }
  });
}
</script>
