import { defineStore } from 'pinia'
import { getMatchList, getMatchDetail } from '../../api/match'

export const useMatchStore = defineStore('match', {
  state: () => ({
    matchList: [],
    currentMatch: null,
    loading: false,
    error: null,
    pagination: { page: 1, total: 0, hasMore: true }
  }),
  actions: {
    async fetchMatchList(params = {}, reset = true) {
      if (reset) {
        this.matchList = []
        this.pagination.page = 1
        this.pagination.hasMore = true
      }
      if (!this.pagination.hasMore) return

      this.loading = true
      this.error = null
      try {
        const res = await getMatchList({ ...params, page: this.pagination.page, size: 10 })
        const list = res.data?.list || []
        this.matchList = reset ? list : [...this.matchList, ...list]
        this.pagination.hasMore = res.data?.hasMore ?? false
        this.pagination.total   = res.data?.total ?? 0
        this.pagination.page++
      } catch (e) {
        this.error = e?.message || '加载失败'
      } finally {
        this.loading = false
      }
    },

    async fetchMore(params = {}) {
      await this.fetchMatchList(params, false)
    },

    async fetchMatchDetail(id) {
      this.loading = true
      this.error = null
      try {
        const res = await getMatchDetail(id)
        this.currentMatch = res.data
      } catch (e) {
        this.error = e?.message || '加载失败'
        this.currentMatch = null
      } finally {
        this.loading = false
      }
    },

    clearError() { this.error = null }
  }
})
