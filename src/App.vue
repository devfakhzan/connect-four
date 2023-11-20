<script setup>
import { useRequestsStore } from "./stores/requests";
import { JsonTreeView } from "json-tree-view-vue3";
import { provide } from "vue";
import axios from "axios";

// axios.interceptors.request.use(request => {
//   console.log('Starting Request', JSON.stringify(request.url, null, 2))
//   return request
// })

axios.interceptors.response.use(
  (response) => {
    const isPost = response?.config?.method?.toUpperCase() === "POST";

    const log = {
      request: {
        method: response.config.method.toUpperCase(),
        url: response.config.url,
      },
      response: response.data,
    };

    if (isPost && response?.config?.data) {
      log.request.body = JSON.parse(response?.config?.data);
    }

    requests.add(log);
    return response;
  },
  (error) => {
    console.log(error)
    const isPost = error.method?.toUpperCase() === "POST";

    const log = {
      request: {
        method: error.config.method.toUpperCase(),
        url: error.config.url,
      },
      response: {
        error: {
          status: error.response.status,
          code: error.code,
          statusText: error.response.statusText
        },
      },
    };

    if (isPost && error.data) {
      log.request.body = JSON.parse(error?.data);
    }
    requests.add(log);
  }
);

provide("axios", axios);

const requests = useRequestsStore();
</script>

<template>
  <div class="main">
    <router-view></router-view>
  </div>
  <div class="console">
    <JsonTreeView
      :data="JSON.stringify(requests.logs)"
      :maxDepth="10"
      rootKey="Last API Request"
    />
  </div>
</template>

<style>
.main {
  height: 80vh;
  overflow-y: scroll;
}
.console {
  height: 20vh;
  overflow-y: scroll;
  border-top: 1px solid black;
}
</style>
