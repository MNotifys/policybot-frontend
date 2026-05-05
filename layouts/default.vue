<template>
  <div class="dashboard">
    <main class="dashboard-main">
      <Sidebar />
      <div class="dashboard-content">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.dashboard {
  height: 100vh;
  display: flex;
}
.dashboard-main {
  flex: 1;
  background: var(--bg);
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column; 
}
.dashboard-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>