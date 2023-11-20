import { defineStore } from 'pinia'

export const useRequestsStore = defineStore('requests', {
  state: () => {
    return { 
        logs: []
    }
  },
  actions: {
    add(logObject) {
      this.logs.unshift(logObject);
      this.logs = this.logs.splice(0, 1);
    },
  },
})