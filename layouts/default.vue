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
}
:deep(.sidebar) {
  background: var(--sidebar-bg);
  border-radius: 22px;
  margin: 22px 18px 2px 22px;
  overflow: hidden;
  flex-shrink: 0;
  /* width: 240px !important; */
  min-width: 300px !important;
}
:deep(.sidebar--collapsed) {
  width: var(--sidebar-collapsed) !important;
  min-width: var(--sidebar-collapsed) !important;
}
.dashboard-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>