<template>
  <div class="title-bar">
    <div class="traffic-lights">
      <button class="traffic-light traffic-light-close" @click="close"></button>
      <button class="traffic-light traffic-light-minimize" @click="minimize"></button>
      <button class="traffic-light traffic-light-maximize" @click="maximize"></button>
    </div>
  </div>
</template>

<script setup>
function close() {
  if (window.api?.windowClose) window.api.windowClose();
}

function minimize() {
  if (window.api?.windowMinimize) window.api.windowMinimize();
}

function maximize() {
  if (window.api?.windowMaximize) window.api.windowMaximize();
}
</script>

<style scoped>
.title-bar {
  grid-row-start: 1;
  grid-column: 1 / -1;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 12px;
  -webkit-app-region: drag;
  flex-shrink: 0;
}

.traffic-lights {
  display: flex;
  gap: 8px;
  -webkit-app-region: no-drag;
}

.traffic-light {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  padding: 0;
  display: inline-block;
}

.traffic-light-close {
  background-color: #ff5f57;
}

.traffic-light-minimize {
  background-color: #febc2e;
}

.traffic-light-maximize {
  background-color: #28c840;
}

.traffic-light:hover {
  opacity: 0.8;
}
</style>
