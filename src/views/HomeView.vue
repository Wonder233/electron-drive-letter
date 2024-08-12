<template>
  <div class="about">
    <button class="mr-10" @click="addSystemDirveLetter">创建盘符</button>
    <button @click="removeSystemDirveLetter">删除盘符</button>
  </div>
</template>

<script lang="ts">
import {
  addSysSyncEntry,
  removeSysSyncEntry,
} from "@/scripts/driveLetterHelper";
import Vue from "vue";

export default Vue.extend({
  name: "DirveLetter",
  methods: {
    addSystemDirveLetter() {
      console.log("创建盘符");
      addSysSyncEntry();
    },
    removeSystemDirveLetter() {
      console.log("删除盘符");
      removeSysSyncEntry();
    },
  },
});
</script>

<style scoped>
.mr-10 {
  margin-right: 10px;
}
</style>
