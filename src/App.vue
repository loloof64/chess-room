<script setup>
import { DialogWrapper } from 'vue3-promise-dialog';
</script>

<template>
  <RouterView></RouterView>
  <notifications />
  <DialogWrapper />
</template>